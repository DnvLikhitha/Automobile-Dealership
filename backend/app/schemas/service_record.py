"""Pydantic schemas for Service Record endpoints."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from uuid import UUID


class ServiceRecordCreate(BaseModel):
    vehicle_id: UUID
    appointment_id: Optional[UUID] = None
    diagnosis: Optional[str] = None
    parts_used: Optional[str] = None
    labour_hours: Optional[float] = 0
    cost: Optional[float] = 0
    next_service_date: Optional[date] = None
    technician_notes: Optional[str] = None


class ServiceRecordUpdate(BaseModel):
    diagnosis: Optional[str] = None
    parts_used: Optional[str] = None
    labour_hours: Optional[float] = None
    cost: Optional[float] = None
    next_service_date: Optional[date] = None
    technician_notes: Optional[str] = None


class ServiceRecordResponse(BaseModel):
    record_id: UUID
    vehicle_id: UUID
    appointment_id: Optional[UUID] = None
    diagnosis: Optional[str] = None
    parts_used: Optional[str] = None
    labour_hours: Optional[float] = None
    cost: Optional[float] = None
    next_service_date: Optional[date] = None
    technician_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
