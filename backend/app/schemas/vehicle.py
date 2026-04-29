"""Pydantic schemas for Vehicle endpoints."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class VehicleCreate(BaseModel):
    make: str
    model: str
    year: int
    price: float
    type: str
    color: Optional[str] = None
    mileage: Optional[int] = 0
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None


class VehicleUpdate(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    price: Optional[float] = None
    type: Optional[str] = None
    availability: Optional[str] = None
    color: Optional[str] = None
    mileage: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None


class VehicleResponse(BaseModel):
    vehicle_id: UUID
    make: str
    model: str
    year: int
    price: float
    type: str
    availability: str
    color: Optional[str] = None
    mileage: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
