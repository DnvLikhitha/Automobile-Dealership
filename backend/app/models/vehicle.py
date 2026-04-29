"""Vehicle SQLAlchemy model."""
import uuid
from sqlalchemy import Column, String, Integer, Numeric, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    vehicle_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    make = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    price = Column(Numeric(12, 2), nullable=False)
    type = Column(String(50), nullable=False)
    availability = Column(String(20), nullable=False, default="available")
    color = Column(String(50))
    mileage = Column(Integer, default=0)
    fuel_type = Column(String(20))
    transmission = Column(String(20))
    image_url = Column(Text)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
