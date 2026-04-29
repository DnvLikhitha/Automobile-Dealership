"""Reports router — dashboards and analytics."""
from fastapi import APIRouter, Depends
from supabase import Client
from app.core.database import get_db
from app.core.security import require_role

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/sales")
def get_sales_report(
    db: Client = Depends(get_db),
    current_user: dict = Depends(require_role("admin", "sales_executive")),
):
    response = db.table("bookings").select("*").execute()
    bookings = response.data
    
    total_bookings = len(bookings)
    delivered = sum(1 for b in bookings if b.get("status") == "delivered")
    pending = sum(1 for b in bookings if b.get("status") in ["inquiry", "test_drive_scheduled", "booking_confirmed"])
    cancelled = sum(1 for b in bookings if b.get("status") == "cancelled")
    
    total_revenue = sum(float(b.get("deposit_amount", 0) or 0) for b in bookings if b.get("status") == "delivered")

    return {
        "total_bookings": total_bookings,
        "delivered": delivered,
        "pending": pending,
        "cancelled": cancelled,
        "total_revenue": total_revenue,
    }


@router.get("/inventory")
def get_inventory_report(
    db: Client = Depends(get_db),
    current_user: dict = Depends(require_role("admin", "sales_executive")),
):
    response = db.table("vehicles").select("*").execute()
    vehicles = response.data
    
    total = len(vehicles)
    available = sum(1 for v in vehicles if v.get("availability") == "available")
    reserved = sum(1 for v in vehicles if v.get("availability") == "reserved")
    sold = sum(1 for v in vehicles if v.get("availability") == "sold")

    by_type = {}
    for v in vehicles:
        v_type = v.get("type", "unknown")
        by_type[v_type] = by_type.get(v_type, 0) + 1

    return {
        "total_vehicles": total,
        "available": available,
        "reserved": reserved,
        "sold": sold,
        "by_type": by_type,
    }


@router.get("/appointments")
def get_appointments_report(
    db: Client = Depends(get_db),
    current_user: dict = Depends(require_role("admin")),
):
    response = db.table("appointments").select("*").execute()
    appointments = response.data
    
    total = len(appointments)
    pending = sum(1 for a in appointments if a.get("status") == "pending")
    in_progress = sum(1 for a in appointments if a.get("status") == "in_progress")
    completed = sum(1 for a in appointments if a.get("status") == "completed")
    cancelled = sum(1 for a in appointments if a.get("status") == "cancelled")

    by_service = {}
    for a in appointments:
        s_type = a.get("service_type", "unknown")
        by_service[s_type] = by_service.get(s_type, 0) + 1

    return {
        "total_appointments": total,
        "pending": pending,
        "in_progress": in_progress,
        "completed": completed,
        "cancelled": cancelled,
        "by_service_type": by_service,
    }
