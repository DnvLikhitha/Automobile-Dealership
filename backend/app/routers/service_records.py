"""Service Records router — maintenance and repair tracking."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.schemas.service_record import ServiceRecordCreate, ServiceRecordUpdate, ServiceRecordResponse

router = APIRouter(prefix="/api/service-records", tags=["Service Records"])


@router.post("", response_model=ServiceRecordResponse, status_code=status.HTTP_201_CREATED)
def create_service_record(
    data: ServiceRecordCreate,
    db: Client = Depends(get_db),
    current_user: dict = Depends(require_role("admin", "technician")),
):
    payload = data.model_dump()
    payload["record_id"] = str(uuid.uuid4())
    payload["vehicle_id"] = str(payload["vehicle_id"])
    if payload.get("appointment_id"):
        payload["appointment_id"] = str(payload["appointment_id"])
    if payload.get("next_service_date"):
        payload["next_service_date"] = payload["next_service_date"].isoformat()

    insert_resp = db.table("service_records").insert(payload).execute()
    if not insert_resp.data:
        raise HTTPException(status_code=500, detail="Failed to create service record")
    return insert_resp.data[0]


@router.get("", response_model=List[ServiceRecordResponse])
def get_service_records(
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = db.table("service_records").select("*")
    response = query.order("created_at", desc=True).execute()
    return response.data


@router.get("/vehicle/{vehicle_id}", response_model=List[ServiceRecordResponse])
def get_vehicle_service_history(
    vehicle_id: str,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    response = db.table("service_records").select("*").eq("vehicle_id", vehicle_id).order("created_at", desc=True).execute()
    return response.data


@router.get("/{record_id}", response_model=ServiceRecordResponse)
def get_service_record(
    record_id: str,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    response = db.table("service_records").select("*").eq("record_id", record_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Service record not found")
    return response.data[0]


@router.patch("/{record_id}", response_model=ServiceRecordResponse)
def update_service_record(
    record_id: str,
    data: ServiceRecordUpdate,
    db: Client = Depends(get_db),
    current_user: dict = Depends(require_role("admin", "technician")),
):
    response = db.table("service_records").select("*").eq("record_id", record_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Service record not found")

    update_data = data.model_dump(exclude_unset=True)
    if "next_service_date" in update_data and update_data["next_service_date"]:
        update_data["next_service_date"] = update_data["next_service_date"].isoformat()

    if update_data:
        response = db.table("service_records").update(update_data).eq("record_id", record_id).execute()
    return response.data[0]
