import logging
import os
import uuid
from collections import Counter
from datetime import datetime, timezone

import yaml
from fastapi import FastAPI, Depends, HTTPException, Request, Query
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db, init_db
from models import Order
from schemas import (
    OrderCreate,
    OrderResponse,
    OrderListResponse,
    OrderStatusUpdate,
    OrderItem,
)
from workflow import submit_order_workflow

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="ShopWave Order Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_status_counter: Counter = Counter()


@app.on_event("startup")
def startup():
    db_dir = os.path.dirname(os.getenv("DB_PATH", "./orders.db"))
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
    init_db()
    logger.info("Order service started")


def _order_to_response(order: Order) -> OrderResponse:
    items = [OrderItem(**item) for item in order.items]
    return OrderResponse(
        order_id=order.order_id,
        customer_id=order.customer_id,
        total=order.total,
        status=order.status,
        workflow_id=order.workflow_id or "unknown",
        items=items,
        created_at=order.created_at,
    )


@app.post("/api/v1/orders", response_model=OrderResponse, status_code=201)
async def create_order(body: OrderCreate, db: Session = Depends(get_db)):
    total = sum(item.quantity * item.unit_price for item in body.items)
    order_id = str(uuid.uuid4())

    order = Order(
        order_id=order_id,
        customer_id=body.customer_id,
        total=total,
        status="confirmed",
        items=[item.model_dump() for item in body.items],
        created_at=datetime.now(timezone.utc),
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    workflow_id = await submit_order_workflow(order_id, total, body.customer_id)
    order.workflow_id = workflow_id
    db.commit()
    db.refresh(order)

    _status_counter[order.status] += 1
    logger.info("Created order %s for customer %s", order_id, body.customer_id)
    return _order_to_response(order)


@app.get("/api/v1/orders", response_model=OrderListResponse)
def list_orders(
    status: str | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    total = query.count()
    orders = (
        query.order_by(Order.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return OrderListResponse(
        orders=[_order_to_response(o) for o in orders],
        total=total,
        limit=limit,
        offset=offset,
    )


@app.get("/api/v1/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _order_to_response(order)


@app.patch("/api/v1/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    body: OrderStatusUpdate,
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    old_status = order.status
    order.status = body.status
    db.commit()
    db.refresh(order)
    _status_counter[body.status] += 1
    logger.info(
        "Updated order %s status: %s -> %s",
        order_id,
        old_status,
        body.status,
    )
    return _order_to_response(order)


@app.get("/health")
def health():
    return {"status": "ok", "service": "order-service", "version": "1.0.0"}


@app.get("/metrics", response_class=PlainTextResponse)
def metrics(db: Session = Depends(get_db)):
    rows = db.query(Order.status).all()
    counts = Counter(row[0] for row in rows)
    lines = [
        "# HELP orders_total Total orders by status",
        "# TYPE orders_total counter",
    ]
    for status, count in sorted(counts.items()):
        lines.append(f'orders_total{{status="{status}"}} {count}')
    if not counts:
        lines.append('orders_total{status="confirmed"} 0')
    return "\n".join(lines) + "\n"


@app.post("/api/v1/orders/import")
async def import_orders(request: Request):
    # WORKSHOP: intentional unsafe deserialisation
    # Uses yaml.load() without SafeLoader — allows arbitrary Python objects
    # This is the RCE entry point in the workshop scenario
    # DO NOT use yaml.load() without SafeLoader in production
    body = await request.body()
    data = yaml.load(body, Loader=yaml.Loader)  # unsafe — intentional for workshop
    return {"imported": data}
