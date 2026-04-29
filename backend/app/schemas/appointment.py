"""Pydantic schemas for Appointment endpoints."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date, time
from uuid import UUID


class AppointmentCreate(BaseModel):
    vehicle_id: Optional[UUID] = None
    service_type: str
    slot_date: date
    slot_time: time
    notes: Optional[str] = None


class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    technician_id: Optional[UUID] = None
    slot_date: Optional[date] = None
    slot_time: Optional[time] = None
    notes: Optional[str] = None


class AppointmentResponse(BaseModel):
    appointment_id: UUID
    customer_id: UUID
    vehicle_id: Optional[UUID] = None
    technician_id: Optional[UUID] = None
    service_type: str
    slot_date: date
    slot_time: time
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
