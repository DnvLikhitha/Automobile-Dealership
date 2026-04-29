"""Vehicle router — CRUD for vehicle inventory."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client
from typing import List, Optional
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])


@router.get("", response_model=List[VehicleResponse])
def get_vehicles(
    make: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    availability: Optional[str] = Query(None, pattern="^(available|reserved|sold)$"),
    fuel_type: Optional[str] = Query(None),
    db: Client = Depends(get_db),
):
    query = db.table("vehicles").select("*")
    if make:
        query = query.ilike("make", f"%{make}%")
    if type:
        query = query.eq("type", type)
    if min_price is not None:
        query = query.gte("price", min_price)
    if max_price is not None:
        query = query.lte("price", max_price)
    if availability:
        query = query.eq("availability", availability)
    if fuel_type:
        query = query.eq("fuel_type", fuel_type)
        
    response = query.order("created_at", desc=True).execute()
    return response.data


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: str, db: Client = Depends(get_db)):
    response = db.table("vehicles").select("*").eq("vehicle_id", vehicle_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return response.data[0]


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    data: VehicleCreate,
    db: Client = Depends(get_db),
    current_user: dict = Depends(require_role("admin", "sales_executive")),
):
    payload = data.model_dump()
    payload["vehicle_id"] = str(uuid.uuid4())
    response = db.table("vehicles").insert(payload).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create vehicle")
    return response.data[0]


@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: str,
    data: VehicleUpdate,
    db: Client = Depends(get_db),
    current_user: dict = Depends(require_role("admin", "sales_executive")),
):
    response = db.table("vehicles").select("*").eq("vehicle_id", vehicle_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    update_data = data.model_dump(exclude_unset=True)
    if update_data:
        response = db.table("vehicles").update(update_data).eq("vehicle_id", vehicle_id).execute()
    return response.data[0]


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: str,
    db: Client = Depends(get_db),
    current_user: dict = Depends(require_role("admin")),
):
    response = db.table("vehicles").select("*").eq("vehicle_id", vehicle_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    db.table("vehicles").delete().eq("vehicle_id", vehicle_id).execute()
