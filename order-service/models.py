import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Float, DateTime, Text
from sqlalchemy.types import JSON

from database import Base


def generate_order_id() -> str:
    return str(uuid.uuid4())


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(String, primary_key=True, default=generate_order_id)
    customer_id = Column(String, nullable=False)
    total = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="pending")
    workflow_id = Column(String, nullable=True, default="unknown")
    items = Column(JSON, nullable=False)
    created_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
