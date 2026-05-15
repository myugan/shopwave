#!/usr/bin/env bash
set -euo pipefail

ORDER_URL="${ORDER_URL:-http://localhost:8080}"
WEB_URL="${WEB_URL:-http://localhost:3000}"
NOTIFY_URL="${NOTIFY_URL:-http://localhost:3001}"

pass() { echo "✓ $1"; }
fail() { echo "✗ $1"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
"$SCRIPT_DIR/ensure-product-images.sh" >/dev/null

echo "ShopWave verification"
echo "  Order API: $ORDER_URL"
echo "  Web:       $WEB_URL"
echo "  Notify:    $NOTIFY_URL"
echo

curl -sf "$ORDER_URL/health" | grep -q '"order-service"' && pass "order-service health" || fail "order-service health"
curl -sf "$NOTIFY_URL/health" | grep -q '"notification-service"' && pass "notification-service health" || fail "notification-service health"

ORDER=$(curl -sf -X POST "$ORDER_URL/api/v1/orders" \
  -H 'Content-Type: application/json' \
  -d '{"customer_id":"verify@shopwave.dev","items":[{"product_id":"prod_001","name":"MechKey Pro 87","quantity":1,"unit_price":129.99}]}')
OID=$(echo "$ORDER" | python3 -c "import sys,json; print(json.load(sys.stdin)['order_id'])")
pass "create order ($OID)"

curl -sf "$ORDER_URL/api/v1/orders/$OID" | grep -q "$OID" && pass "get order" || fail "get order"
curl -sf -X PATCH "$ORDER_URL/api/v1/orders/$OID/status" \
  -H 'Content-Type: application/json' \
  -d '{"status":"shipped"}' | grep -q shipped && pass "patch order status" || fail "patch status"

curl -sf "$ORDER_URL/metrics" | grep -q 'orders_total' && pass "order metrics" || fail "order metrics"
curl -sf -X POST "$ORDER_URL/api/v1/orders/import" \
  -H 'Content-Type: application/x-yaml' \
  --data-binary 'ping: ok' | grep -q imported && pass "yaml import" || fail "yaml import"

curl -sf -X POST "$NOTIFY_URL/webhook/workflow-complete" \
  -H 'Content-Type: application/json' \
  -d '{"metadata":{"name":"wf-1","labels":{"order-id":"'"$OID"'"}},"status":{"phase":"Succeeded"}}' \
  | grep -q '"received":true' && pass "workflow webhook" || fail "workflow webhook"

for path in / /products /products/prod_001 /cart /checkout /orders/import; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$WEB_URL$path")
  [[ "$code" == "200" ]] && pass "web $path" || fail "web $path (HTTP $code)"
done

for id in prod_001 prod_006; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$WEB_URL/products/${id}.jpg")
  [[ "$code" == "200" ]] && pass "image $id" || fail "image $id (HTTP $code)"
done

curl -sf -X POST "$WEB_URL/api/orders/import" \
  -H 'Content-Type: application/x-yaml' \
  --data-binary 'via: proxy' | grep -q imported && pass "web /api/orders proxy" || fail "web /api/orders proxy"

ORDER_VIA_WEB=$(curl -sf -X POST "$WEB_URL/api/orders" \
  -H 'Content-Type: application/json' \
  -d '{"customer_id":"web-proxy@shopwave.dev","items":[{"product_id":"prod_002","name":"AeroGlide X Mouse","quantity":1,"unit_price":79.99}]}')
echo "$ORDER_VIA_WEB" | grep -q order_id && pass "web create order via proxy" || fail "web create order via proxy"

echo
echo "All checks passed."
