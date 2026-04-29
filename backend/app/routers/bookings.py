"""Booking router — sales & booking workflow."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.schemas.booking import BookingCreate, BookingUpdate, BookingResponse

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    data: BookingCreate,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    # Verify vehicle exists and is available
    res_veh = db.table("vehicles").select("*").eq("vehicle_id", str(data.vehicle_id)).execute()
    if not res_veh.data:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    vehicle = res_veh.data[0]
    if vehicle.get("availability") != "available":
        raise HTTPException(status_code=400, detail="Vehicle is not available for booking")

    booking_payload = {
        "booking_id": str(uuid.uuid4()),
        "customer_id": current_user["user_id"],
        "vehicle_id": str(data.vehicle_id),
        "booking_date": data.booking_date.isoformat() if data.booking_date else None,
        "notes": data.notes,
        "status": "inquiry",
    }
    
    insert_resp = db.table("bookings").insert(booking_payload).execute()
    if not insert_resp.data:
        raise HTTPException(status_code=500, detail="Failed to create booking")
        
    return insert_resp.data[0]


@router.get("", response_model=List[BookingResponse])
def get_bookings(
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = db.table("bookings").select("*")
    if current_user["role"] not in ("admin", "sales_executive"):
        query = query.eq("customer_id", current_user["user_id"])
        
    response = query.order("created_at", desc=True).execute()
    return response.data


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: str,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    response = db.table("bookings").select("*").eq("booking_id", booking_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking = response.data[0]
    if current_user["role"] == "customer" and booking["customer_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
        
    return booking


@router.patch("/{booking_id}", response_model=BookingResponse)
def update_booking(
    booking_id: str,
    data: BookingUpdate,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    response = db.table("bookings").select("*").eq("booking_id", booking_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking = response.data[0]
    role = current_user["role"]
    update_data = data.model_dump(exclude_unset=True)
    
    new_status = update_data.get("status")

    if role == "customer":
        if booking["customer_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="You can only update your own bookings")
        if list(update_data.keys()) != ["status"] or new_status != "cancelled":
            raise HTTPException(status_code=403, detail="Customers can only cancel bookings")
        if booking["status"] in ["delivered", "cancelled"]:
            raise HTTPException(status_code=400, detail=f"Cannot cancel a booking that is {booking['status']}")
    else:
        # Admin or Sales Executive verification
        if role not in ["admin", "sales_executive"]:
            raise HTTPException(status_code=403, detail="Unauthorized role")

    if update_data:
        response = db.table("bookings").update(update_data).eq("booking_id", booking_id).execute()
        booking = response.data[0]

    # If delivered, mark vehicle as sold
    if "status" in update_data and update_data["status"] == "delivered":
        db.table("vehicles").update({"availability": "sold"}).eq("vehicle_id", booking["vehicle_id"]).execute()

    # If booking confirmed, mark vehicle as reserved
    if "status" in update_data and update_data["status"] == "booking_confirmed":
        db.table("vehicles").update({"availability": "reserved"}).eq("vehicle_id", booking["vehicle_id"]).execute()

    # If cancelled, and it was reserved, free up the vehicle
    if "status" in update_data and update_data["status"] == "cancelled" and booking["status"] in ["booking_confirmed", "test_drive_scheduled"]:
        # We assume if it was cancelled, it goes back to available, but maybe only if it wasn't sold
        db.table("vehicles").update({"availability": "available"}).eq("vehicle_id", booking["vehicle_id"]).execute()

    return booking
