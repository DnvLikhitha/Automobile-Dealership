import os
import uuid
from app.core.database import supabase

def seed_likhitha():
    print("Seeding Likhitha's account...")
    # Find user
    res = supabase.table("users").select("*").eq("email", "likhitha@gmail.com").execute()
    if not res.data:
        print("User not found!")
        return
    user_id = res.data[0]["user_id"]
    
    # Get a vehicle
    veh_res = supabase.table("vehicles").select("*").execute()
    if not veh_res.data:
        print("No vehicles found!")
        return
    vehicle = veh_res.data[0] # Tesla
    vehicle2 = veh_res.data[1] if len(veh_res.data) > 1 else None

    # Insert a booking
    booking = {
        "booking_id": str(uuid.uuid4()),
        "customer_id": user_id,
        "vehicle_id": vehicle["vehicle_id"],
        "status": "delivered",
        "notes": "Purchased Tesla Model S",
    }
    supabase.table("bookings").insert(booking).execute()
    print("Added Booking.")

    # Insert an appointment
    appt = {
        "appointment_id": str(uuid.uuid4()),
        "customer_id": user_id,
        "vehicle_id": vehicle["vehicle_id"],
        "service_type": "maintenance",
        "slot_date": "2026-05-01",
        "slot_time": "10:00",
        "status": "pending",
        "notes": "First free maintenance checkup",
    }
    supabase.table("appointments").insert(appt).execute()
    print("Added Appointment.")

if __name__ == "__main__":
    seed_likhitha()
