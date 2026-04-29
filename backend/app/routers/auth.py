"""Authentication router — register, login, get current user."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_user,
    require_role,
)
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Client = Depends(get_db)):
    # Check if email already exists
    response = db.table("users").select("*").eq("email", data.email).execute()
    if response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Validate role
    valid_roles = ["admin", "sales_executive", "technician", "customer"]
    if data.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}",
        )

    user_payload = {
        "user_id": str(uuid.uuid4()),
        "name": data.name,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "role": data.role,
        "phone": data.phone,
    }
    
    insert_resp = db.table("users").insert(user_payload).execute()
    if not insert_resp.data:
        raise HTTPException(status_code=500, detail="Failed to create user")
        
    user_data = insert_resp.data[0]

    access_token = create_access_token({"sub": str(user_data["user_id"]), "role": user_data["role"]})
    refresh_token = create_refresh_token({"sub": str(user_data["user_id"]), "role": user_data["role"]})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(**user_data),
    )


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Client = Depends(get_db)):
    response = db.table("users").select("*").eq("email", data.email).execute()
    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
        
    user_data = response.data[0]
    if not verify_password(data.password, user_data.get("password_hash")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token({"sub": str(user_data["user_id"]), "role": user_data["role"]})
    refresh_token = create_refresh_token({"sub": str(user_data["user_id"]), "role": user_data["role"]})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(**user_data),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)


@router.patch("/me", response_model=UserResponse)
def update_profile(
    data: dict,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    allowed_fields = {"name", "phone"}
    update_data = {k: v for k, v in data.items() if k in allowed_fields and v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    response = db.table("users").update(update_data).eq("user_id", current_user["user_id"]).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to update profile")
    return UserResponse(**response.data[0])


@router.get("/users")
def list_users(
    db: Client = Depends(get_db),
    current_user: dict = Depends(require_role("admin")),
):
    response = db.table("users").select("user_id, name, email, role, phone, created_at").order("created_at", desc=True).execute()
    return response.data


@router.get("/technicians")
def list_technicians(
    db: Client = Depends(get_db),
    current_user: dict = Depends(require_role("admin")),
):
    """Return all technicians for the admin to assign to service appointments."""
    response = (
        db.table("users")
        .select("user_id, name, email, phone")
        .eq("role", "technician")
        .order("name")
        .execute()
    )
    return response.data
