"""Pydantic schemas for Booking endpoints."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class BookingCreate(BaseModel):
    vehicle_id: UUID
    booking_date: Optional[datetime] = None
    notes: Optional[str] = None


class BookingUpdate(BaseModel):
    status: Optional[str] = None
    test_drive_date: Optional[datetime] = None
    delivery_date: Optional[datetime] = None
    deposit_amount: Optional[float] = None
    notes: Optional[str] = None
    sales_executive_id: Optional[UUID] = None


class BookingResponse(BaseModel):
    booking_id: UUID
    customer_id: UUID
    vehicle_id: UUID
    sales_executive_id: Optional[UUID] = None
    status: str
    booking_date: Optional[datetime] = None
    test_drive_date: Optional[datetime] = None
    delivery_date: Optional[datetime] = None
    deposit_amount: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
