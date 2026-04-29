"""Appointments router — service scheduling with admin approval workflow."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    data: AppointmentCreate,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    # Check for slot conflicts
    conflict_res = db.table("appointments").select("*").eq("slot_date", data.slot_date.isoformat() if data.slot_date else None).eq("slot_time", data.slot_time.isoformat() if data.slot_time else None).in_("status", ["pending", "approved", "in_progress"]).execute()
    
    if conflict_res.data:
        raise HTTPException(status_code=400, detail="Time slot is already booked")

    appointment_payload = {
        "appointment_id": str(uuid.uuid4()),
        "customer_id": current_user["user_id"],
        "vehicle_id": str(data.vehicle_id) if data.vehicle_id else None,
        "service_type": data.service_type,
        "slot_date": data.slot_date.isoformat() if data.slot_date else None,
        "slot_time": data.slot_time.isoformat() if data.slot_time else None,
        "notes": data.notes,
        "status": "pending",
    }
    
    insert_resp = db.table("appointments").insert(appointment_payload).execute()
    if not insert_resp.data:
        raise HTTPException(status_code=500, detail="Failed to create appointment")
        
    return insert_resp.data[0]


@router.get("", response_model=List[AppointmentResponse])
def get_appointments(
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = db.table("appointments").select("*")

    if current_user["role"] == "technician":
        # Technicians only see appointments assigned to them
        # that have been approved or are further along
        query = (
            query
            .eq("technician_id", current_user["user_id"])
            .in_("status", ["approved", "in_progress", "completed"])
        )
    elif current_user["role"] == "admin":
        # Admin sees all appointments
        pass
    else:
        # Customers see only their own
        query = query.eq("customer_id", current_user["user_id"])
        
    response = query.order("slot_date", desc=True).execute()
    return response.data


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: str,
    data: AppointmentUpdate,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    response = db.table("appointments").select("*").eq("appointment_id", appointment_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Appointment not found")

    existing = response.data[0]
    role = current_user["role"]
    update_data = data.model_dump(exclude_unset=True)

    # ── Role-based permissions & status transition rules ──
    new_status = update_data.get("status")

    if role == "customer":
        # Customers can ONLY cancel their own appointments
        if existing["customer_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="You can only update your own appointments")
        # Ensure they are only trying to cancel
        if list(update_data.keys()) != ["status"] or new_status != "cancelled":
            raise HTTPException(status_code=403, detail="Customers can only cancel appointments")
        if existing["status"] in ["completed", "cancelled"]:
            raise HTTPException(status_code=400, detail=f"Cannot cancel an appointment that is {existing['status']}")

    elif new_status:
        if role == "admin":
            # Admin can: pending → approved (must assign technician)
            #            any → cancelled
            if new_status == "approved":
                if existing["status"] != "pending":
                    raise HTTPException(
                        status_code=400,
                        detail="Can only approve appointments that are pending"
                    )
                # Must assign a technician when approving
                tech_id = update_data.get("technician_id")
                if not tech_id:
                    raise HTTPException(
                        status_code=400,
                        detail="Must assign a technician when approving"
                    )
            elif new_status == "cancelled":
                pass  # Admin can cancel from any state
            else:
                # Admin can also do other transitions if needed
                pass

        elif role == "technician":
            # Technician can: approved → in_progress
            #                 in_progress → completed
            allowed_transitions = {
                "approved": ["in_progress"],
                "in_progress": ["completed"],
            }
            allowed = allowed_transitions.get(existing["status"], [])
            if new_status not in allowed:
                raise HTTPException(
                    status_code=400,
                    detail=f"Technician cannot change status from '{existing['status']}' to '{new_status}'"
                )
            # Ensure technician is only updating their own assigned jobs
            if existing.get("technician_id") != current_user["user_id"]:
                raise HTTPException(
                    status_code=403,
                    detail="You can only update appointments assigned to you"
                )
        else:
            raise HTTPException(status_code=403, detail="Unauthorized role")

    # Convert date/time for serialization
    if "slot_date" in update_data and update_data["slot_date"]:
        update_data["slot_date"] = update_data["slot_date"].isoformat()
    if "slot_time" in update_data and update_data["slot_time"]:
        update_data["slot_time"] = update_data["slot_time"].isoformat()
    if "technician_id" in update_data and update_data["technician_id"]:
        update_data["technician_id"] = str(update_data["technician_id"])

    if update_data:
        response = db.table("appointments").update(update_data).eq("appointment_id", appointment_id).execute()
        
    return response.data[0]
