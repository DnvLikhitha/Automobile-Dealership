"""ServiceRecord SQLAlchemy model."""
import uuid
from sqlalchemy import Column, String, Numeric, Text, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base


class ServiceRecord(Base):
    __tablename__ = "service_records"

    record_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), nullable=False)
    appointment_id = Column(UUID(as_uuid=True))
    diagnosis = Column(Text)
    parts_used = Column(Text)
    labour_hours = Column(Numeric(5, 2), default=0)
    cost = Column(Numeric(12, 2), default=0)
    next_service_date = Column(Date)
    technician_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
