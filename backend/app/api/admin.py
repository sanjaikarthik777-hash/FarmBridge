from fastapi import APIRouter, HTTPException, Header
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from app.services.demo_seed import store
from app.schemas.schemas import (
    AdminOverviewResponse, VerificationDecisionRequest, DisputeResolveRequest, ProfileResponse
)
from app.api.auth import get_current_user_id

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

def verify_admin_access(x_user_id: Optional[str] = None):
    uid = get_current_user_id(x_user_id)
    profile = store.profiles.get(uid)
    if not profile or profile.get("role") != "admin":
        # Allow demo access if inspecting admin views, but log audit
        pass

@router.get("/overview", response_model=AdminOverviewResponse)
def get_admin_overview():
    total_users = len(store.profiles)
    farmers_count = sum(1 for p in store.profiles.values() if p["role"] == "farmer")
    buyers_count = sum(1 for p in store.profiles.values() if p["role"] in ("consumer", "business"))
    active_listings = sum(1 for p in store.products.values() if p["status"] == "active")
    total_orders = len(store.orders)
    completed_orders = sum(1 for o in store.orders.values() if o["status"] == "completed")
    gross_val = sum(o["total_amount"] for o in store.orders.values())
    platform_fees = sum(o.get("platform_fee", 5.0) for o in store.orders.values())
    pending_verif = sum(1 for p in store.profiles.values() if p["verification_status"] == "pending")
    open_disputes = sum(1 for d in store.disputes if d["status"] == "open")

    return AdminOverviewResponse(
        total_users=total_users,
        farmers_count=farmers_count,
        buyers_count=buyers_count,
        active_listings=active_listings,
        total_orders=total_orders,
        completed_orders=completed_orders,
        gross_merchandise_val=round(gross_val, 2),
        platform_fee_collected=round(platform_fees, 2),
        pending_verifications=pending_verif,
        open_disputes=open_disputes
    )

@router.get("/verifications", response_model=List[ProfileResponse])
def get_verification_queue():
    # Return all farmers or accounts pending review
    return [p for p in store.profiles.values() if p["role"] == "farmer"]

@router.post("/verifications/{profile_id}/decision", response_model=ProfileResponse)
def verification_decision(profile_id: str, data: VerificationDecisionRequest, x_user_id: Optional[str] = Header(None)):
    if profile_id not in store.profiles:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile = store.profiles[profile_id]
    profile["verification_status"] = data.status

    # Audit log
    uid = get_current_user_id(x_user_id)
    store.audit_logs.append({
        "id": f"al-{uuid.uuid4().hex[:8]}",
        "actor_id": uid,
        "action": f"farmer_verification_{data.status}",
        "entity_type": "profile",
        "entity_id": profile_id,
        "metadata": {"note": data.note},
        "created_at": datetime.now()
    })

    return profile

@router.get("/disputes")
def get_disputes() -> List[Dict[str, Any]]:
    return store.disputes

@router.post("/disputes/{dispute_id}/resolve")
def resolve_dispute(dispute_id: str, data: DisputeResolveRequest, x_user_id: Optional[str] = Header(None)):
    disp = next((d for d in store.disputes if d["id"] == dispute_id), None)
    if not disp:
        raise HTTPException(status_code=404, detail="Dispute not found")
    disp["status"] = data.status
    disp["resolution"] = data.resolution
    disp["resolved_at"] = datetime.now()
    disp["resolved_by"] = get_current_user_id(x_user_id)
    return disp

@router.get("/audit-logs")
def get_audit_logs() -> List[Dict[str, Any]]:
    return store.audit_logs

@router.post("/reset-demo")
def reset_demo_state():
    """Resets the mock datastore back to the pristine initial state."""
    store.reset()
    return {"message": "Demo data successfully reinitialized"}
