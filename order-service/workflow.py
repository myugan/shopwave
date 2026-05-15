import httpx
import os
import logging

logger = logging.getLogger(__name__)

ARGO_SERVER    = os.getenv("ARGO_SERVER", "localhost:2746")
ARGO_TOKEN     = os.getenv("ARGO_TOKEN", "")
ARGO_NAMESPACE = os.getenv("ARGO_NAMESPACE", "production")
ARGO_SCHEME    = os.getenv("ARGO_SCHEME", "https")


async def submit_order_workflow(order_id: str, total: float, customer_id: str) -> str:
    """
    Submit the order-placed Argo workflow.

    The workflow runs three sequential steps:
      1. validate-stock  — checks inventory
      2. charge-payment  — processes payment
      3. send-invoice    — reads SendGrid key from K8s Secret, sends email

    The send-invoice step is why argo-workflow-sa needs secrets:get
    on the production namespace — it reads the sendgrid-api-key Secret
    at runtime so the key can be rotated without redeploying.
    """
    if not ARGO_TOKEN:
        logger.warning("ARGO_TOKEN not set — skipping workflow submission")
        return "unknown"

    workflow = {
        "workflow": {
            "metadata": {
                "generateName": "order-placed-",
                "namespace": ARGO_NAMESPACE,
                "labels": {
                    "app": "order-service",
                    "order-id": order_id
                }
            },
            "spec": {
                "serviceAccountName": "argo-workflow-sa",
                "entrypoint": "order-steps",
                "arguments": {
                    "parameters": [
                        {"name": "order-id",    "value": order_id},
                        {"name": "customer-id", "value": customer_id},
                        {"name": "total",       "value": str(total)}
                    ]
                },
                "templates": [
                    {
                        "name": "order-steps",
                        "steps": [
                            [{"name": "validate-stock", "template": "validate-stock-tmpl",
                              "arguments": {"parameters": [
                                  {"name": "order-id", "value": "{{workflow.parameters.order-id}}"}]}}],
                            [{"name": "charge-payment", "template": "charge-payment-tmpl",
                              "arguments": {"parameters": [
                                  {"name": "total", "value": "{{workflow.parameters.total}}"}]}}],
                            [{"name": "send-invoice", "template": "send-invoice-tmpl",
                              "arguments": {"parameters": [
                                  {"name": "order-id",    "value": "{{workflow.parameters.order-id}}"},
                                  {"name": "customer-id", "value": "{{workflow.parameters.customer-id}}"}]}}]
                        ]
                    },
                    {
                        "name": "validate-stock-tmpl",
                        "inputs": {"parameters": [{"name": "order-id"}]},
                        "container": {
                            "image": "busybox",
                            "command": ["sh", "-c"],
                            "args": ["echo 'Validating stock for order {{inputs.parameters.order-id}}'; sleep 2; echo OK"]
                        }
                    },
                    {
                        "name": "charge-payment-tmpl",
                        "inputs": {"parameters": [{"name": "total"}]},
                        "container": {
                            "image": "busybox",
                            "command": ["sh", "-c"],
                            "args": ["echo 'Charging ${{inputs.parameters.total}}'; sleep 2; echo OK"]
                        }
                    },
                    {
                        "name": "send-invoice-tmpl",
                        "inputs": {"parameters": [{"name": "order-id"}, {"name": "customer-id"}]},
                        "container": {
                            "image": "busybox",
                            "command": ["sh", "-c"],
                            "args": [
                                "SENDGRID_KEY=$(cat /var/run/secrets/sendgrid/SENDGRID_KEY 2>/dev/null || echo 'not-mounted'); "
                                "echo \"Sending invoice for order {{inputs.parameters.order-id}} "
                                "to customer {{inputs.parameters.customer-id}}\"; "
                                "echo \"Using SendGrid key: ${SENDGRID_KEY:0:10}...\"; "
                                "sleep 2; echo OK"
                            ],
                            "volumeMounts": [
                                {
                                    "name": "sendgrid-secret",
                                    "mountPath": "/var/run/secrets/sendgrid",
                                    "readOnly": True
                                }
                            ]
                        }
                    }
                ],
                "volumes": [
                    {
                        "name": "sendgrid-secret",
                        "secret": {"secretName": "sendgrid-api-key"}
                    }
                ]
            }
        }
    }

    headers = {
        "Authorization": ARGO_TOKEN,
        "Content-Type": "application/json"
    }
    url = f"{ARGO_SCHEME}://{ARGO_SERVER}/api/v1/workflows/{ARGO_NAMESPACE}"

    async with httpx.AsyncClient(verify=False, timeout=5.0) as client:
        try:
            resp = await client.post(url, json=workflow, headers=headers)
            resp.raise_for_status()
            name = resp.json()["metadata"]["name"]
            logger.info(f"Submitted workflow {name} for order {order_id}")
            return name
        except Exception as e:
            logger.warning(f"Workflow submission failed for order {order_id}: {e}")
            return "unknown"
