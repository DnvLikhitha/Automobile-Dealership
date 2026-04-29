import os
import uuid
from app.core.database import supabase
from app.core.security import hash_password

def seed_db():
    print("Seed process started.")
    try:
        # 1. Create Mock Users
        print("Creating mock users...")
        users_to_create = [
            {"email": "admin@autox.com", "name": "Admin User", "role": "admin", "password": "password123"},
            {"email": "sales@autox.com", "name": "Sales Executive", "role": "sales_executive", "password": "password123"},
            {"email": "tech@autox.com", "name": "Head Technician", "role": "technician", "password": "password123"},
            {"email": "customer@autox.com", "name": "John Customer", "role": "customer", "password": "password123"}
        ]
        
        for u in users_to_create:
            response = supabase.table("users").select("*").eq("email", u["email"]).execute()
            if not response.data:
                user_payload = {
                    "user_id": str(uuid.uuid4()),
                    "email": u["email"],
                    "name": u["name"],
                    "role": u["role"],
                    "password_hash": hash_password(u["password"])
                }
                supabase.table("users").insert(user_payload).execute()
        
        # 2. Create Mock Vehicles
        print("Creating mock vehicles...")
        vehicles_to_create = [
            {
                "make": "Tesla",
                "model": "Model S Plaid",
                "year": 2026,
                "price": 115000.0,
                "type": "sedan",
                "availability": "available",
                "fuel_type": "Electric",
                "transmission": "Automatic",
                "mileage": 1500,
                "color": "Midnight Silver",
                "image_url": "https://images.unsplash.com/photo-1617704548623-340376564e68?q=80&w=800&auto=format&fit=crop"
            },
            {
                "make": "Porsche",
                "model": "911 GT3 RS",
                "year": 2025,
                "price": 280000.0,
                "type": "sports",
                "availability": "available",
                "fuel_type": "Petrol",
                "transmission": "PDK",
                "mileage": 500,
                "color": "Guards Red",
                "image_url": "https://images.unsplash.com/photo-1503376712396-6104bc1fc484?q=80&w=800&auto=format&fit=crop"
            },
            {
                "make": "Range Rover",
                "model": "Autobiography",
                "year": 2026,
                "price": 145000.0,
                "type": "suv",
                "availability": "reserved",
                "fuel_type": "Hybrid",
                "transmission": "Automatic",
                "mileage": 50,
                "color": "Santorini Black",
                "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBMGOe6Uzc7nyFKqkFUDOLWH5MWUSTPsbeXg&s"
            },
            {
                "make": "BMW",
                "model": "M4 Competition",
                "year": 2024,
                "price": 85000.0,
                "type": "coupe",
                "availability": "sold",
                "fuel_type": "Petrol",
                "transmission": "Automatic",
                "mileage": 12000,
                "color": "Isle of Man Green",
                "image_url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800&auto=format&fit=crop"
            }
        ]

        for v in vehicles_to_create:
            # Check if exists by make and model
            response = supabase.table("vehicles").select("*").eq("make", v["make"]).eq("model", v["model"]).execute()
            if not response.data:
                v["vehicle_id"] = str(uuid.uuid4())
                supabase.table("vehicles").insert(v).execute()

        # 3. Create Mock Bookings
        print("Creating mock bookings...")
        
        # Fetch user and vehicle IDs from DB
        customer_res = supabase.table("users").select("user_id").eq("email", "customer@autox.com").execute()
        sales_res = supabase.table("users").select("user_id").eq("email", "sales@autox.com").execute()
        all_vehicles = supabase.table("vehicles").select("vehicle_id, make, model").execute()
        
        if customer_res.data and all_vehicles.data:
            customer_id = customer_res.data[0]["user_id"]
            sales_id = sales_res.data[0]["user_id"] if sales_res.data else None
            
            vehicle_map = {}
            for v in all_vehicles.data:
                vehicle_map[f"{v['make']} {v['model']}"] = v["vehicle_id"]
            
            bookings_to_create = [
                {
                    "customer_id": customer_id,
                    "vehicle_id": vehicle_map.get("BMW M4 Competition"),
                    "sales_executive_id": sales_id,
                    "status": "delivered",
                    "booking_date": "2026-03-01T10:00:00",
                    "delivery_date": "2026-03-15T14:00:00",
                    "deposit_amount": 85000.0,
                    "notes": "Full payment completed. Customer very satisfied."
                },
                {
                    "customer_id": customer_id,
                    "vehicle_id": vehicle_map.get("Range Rover Autobiography"),
                    "sales_executive_id": sales_id,
                    "status": "booking_confirmed",
                    "booking_date": "2026-04-05T11:00:00",
                    "deposit_amount": 25000.0,
                    "notes": "Customer paid deposit. Awaiting full payment."
                },
                {
                    "customer_id": customer_id,
                    "vehicle_id": vehicle_map.get("Porsche 911 GT3 RS"),
                    "sales_executive_id": sales_id,
                    "status": "test_drive_scheduled",
                    "booking_date": "2026-04-10T09:00:00",
                    "test_drive_date": "2026-04-14T15:00:00",
                    "notes": "Customer wants to test drive before deciding."
                },
                {
                    "customer_id": customer_id,
                    "vehicle_id": vehicle_map.get("Tesla Model S Plaid"),
                    "status": "inquiry",
                    "booking_date": "2026-04-12T16:00:00",
                    "notes": "Customer inquired about financing options."
                }
            ]
            
            # Check if bookings already exist
            existing_bookings = supabase.table("bookings").select("booking_id").eq("customer_id", customer_id).execute()
            if not existing_bookings.data:
                for b in bookings_to_create:
                    if b.get("vehicle_id"):
                        b["booking_id"] = str(uuid.uuid4())
                        supabase.table("bookings").insert(b).execute()
                print(f"  Created {len(bookings_to_create)} mock bookings.")
            else:
                print("  Bookings already exist, skipping.")

        # 4. Create Mock Appointments
        print("Creating mock appointments...")
        
        tech_res = supabase.table("users").select("user_id").eq("email", "tech@autox.com").execute()
        tech_id = tech_res.data[0]["user_id"] if tech_res.data else None
        
        if customer_res.data and all_vehicles.data:
            existing_appts = supabase.table("appointments").select("appointment_id").eq("customer_id", customer_id).execute()
            if not existing_appts.data:
                appointments_to_create = [
                    {
                        "customer_id": customer_id,
                        "vehicle_id": vehicle_map.get("BMW M4 Competition"),
                        "technician_id": tech_id,
                        "service_type": "full_service",
                        "slot_date": "2026-04-14",
                        "slot_time": "09:00:00",
                        "status": "in_progress",
                        "notes": "30,000 mile full service. Check brakes and suspension."
                    },
                    {
                        "customer_id": customer_id,
                        "vehicle_id": vehicle_map.get("BMW M4 Competition"),
                        "technician_id": tech_id,
                        "service_type": "oil_change",
                        "slot_date": "2026-04-14",
                        "slot_time": "11:00:00",
                        "status": "pending",
                        "notes": "Synthetic oil change requested."
                    },
                    {
                        "customer_id": customer_id,
                        "vehicle_id": vehicle_map.get("Tesla Model S Plaid"),
                        "service_type": "general_checkup",
                        "slot_date": "2026-04-15",
                        "slot_time": "10:00:00",
                        "status": "pending",
                        "notes": "Pre-purchase inspection requested."
                    },
                    {
                        "customer_id": customer_id,
                        "vehicle_id": vehicle_map.get("Porsche 911 GT3 RS"),
                        "technician_id": tech_id,
                        "service_type": "brake_inspection",
                        "slot_date": "2026-04-13",
                        "slot_time": "14:00:00",
                        "status": "completed",
                        "notes": "Brake pads replaced. All clear."
                    },
                    {
                        "customer_id": customer_id,
                        "vehicle_id": vehicle_map.get("Range Rover Autobiography"),
                        "technician_id": tech_id,
                        "service_type": "tire_rotation",
                        "slot_date": "2026-04-16",
                        "slot_time": "09:30:00",
                        "status": "pending",
                        "notes": "Rotate all four tires. Check alignment."
                    },
                    {
                        "customer_id": customer_id,
                        "vehicle_id": vehicle_map.get("BMW M4 Competition"),
                        "technician_id": tech_id,
                        "service_type": "ac_service",
                        "slot_date": "2026-04-12",
                        "slot_time": "15:00:00",
                        "status": "completed",
                        "notes": "AC recharge and filter replacement done."
                    }
                ]
                
                for a in appointments_to_create:
                    if a.get("vehicle_id"):
                        a["appointment_id"] = str(uuid.uuid4())
                        supabase.table("appointments").insert(a).execute()
                print(f"  Created {len(appointments_to_create)} mock appointments.")
            else:
                print("  Appointments already exist, skipping.")

        print("Database successfully seeded! DONE")
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error seeding database: {e}")

if __name__ == "__main__":
    seed_db()
