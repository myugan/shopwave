from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class OrderItem(BaseModel):
    product_id: str
    name: str
    quantity: int
    unit_price: float


class OrderCreate(BaseModel):
    customer_id: str
    items: list[OrderItem]


class OrderStatusUpdate(BaseModel):
    status: str


class OrderResponse(BaseModel):
    order_id: str
    customer_id: str
    total: float
    status: str
    workflow_id: str
    items: list[OrderItem]
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    orders: list[OrderResponse]
    total: int
    limit: int
    offset: int
