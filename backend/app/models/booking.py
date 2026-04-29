"""Booking SQLAlchemy model."""
import uuid
from sqlalchemy import Column, String, Numeric, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    booking_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), nullable=False)
    vehicle_id = Column(UUID(as_uuid=True), nullable=False)
    sales_executive_id = Column(UUID(as_uuid=True))
    status = Column(String(30), nullable=False, default="inquiry")
    booking_date = Column(DateTime(timezone=True))
    test_drive_date = Column(DateTime(timezone=True))
    delivery_date = Column(DateTime(timezone=True))
    deposit_amount = Column(Numeric(12, 2), default=0)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
