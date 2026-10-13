from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional, List
import uuid
import random
from datetime import datetime, timedelta
import httpx
from app.services.demo_seed import store
from app.core.config import settings
from app.schemas.schemas import (
    ProfileResponse, ProfileBase, SendOTPRequest, SendOTPResponse,
    VerifyOTPRequest, FarmerRegisterRequest, ConsumerRegisterRequest,
    SupabaseSyncRequest, AuthResponse, FarmResponse, RoleEnum
)

router = APIRouter(prefix="/auth", tags=["Authentication & Mobile OTP"])

def normalize_phone(phone: str) -> str:
    cleaned = "".join(ch for ch in phone if ch.isdigit() or ch == "+")
    if not cleaned.startswith("+"):
        if len(cleaned) == 10:
            cleaned = "+91" + cleaned
        elif cleaned.startswith("91") and len(cleaned) == 12:
            cleaned = "+" + cleaned
        else:
            cleaned = "+91" + cleaned
    return cleaned

# Active session store token -> user_id
active_sessions: dict[str, str] = {}

def get_current_user_id(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None),
    allow_fallback: bool = True
) -> Optional[str]:
    # 1. Check Bearer token
    if authorization:
        token = authorization
        if token.startswith("Bearer "):
            token = token.split(" ")[1]
        if token in active_sessions:
            return active_sessions[token]
        if token in store.profiles:
            return token

    # 2. Check x-user-id header
    if x_user_id:
        if x_user_id in active_sessions:
            return active_sessions[x_user_id]
        if x_user_id in store.profiles:
            return x_user_id

    # 3. Default fallback to Demo Consumer Kavitha Sundaram for public catalog browsing
    if allow_fallback:
        return "b1000000-0000-0000-0000-000000000001"
    return None

def send_brevo_sms_otp(phone: str, otp: str):
    if not settings.BREVO_API_KEY:
        print("BREVO_API_KEY not set. Skipping real SMS sending.")
        return False
        
    url = "https://api.brevo.com/v3/transactionalSMS/sms"
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": settings.BREVO_API_KEY
    }
    payload = {
        "sender": settings.BREVO_SENDER_NAME[:11],
        "recipient": phone,
        "content": f"Your FarmBridge login OTP is {otp}. It is valid for 5 minutes. Do not share this with anyone."
    }
    try:
        # Fire and forget (or use async httpx.AsyncClient if preferred, but sync is okay here for simplicity)
        with httpx.Client() as client:
            response = client.post(url, json=payload, headers=headers, timeout=5.0)
            response.raise_for_status()
            print(f"Brevo SMS sent successfully to {phone}")
            return True
    except Exception as e:
        print(f"Failed to send Brevo SMS: {e}")
        return False


@router.post("/send-otp", response_model=SendOTPResponse)
def send_otp(data: SendOTPRequest):
    phone = normalize_phone(data.mobile)
    if len(phone) < 12:
        raise HTTPException(status_code=400, detail="Please enter a valid 10-digit Indian mobile number")

    # Generate 6-digit OTP. For local demo, use standard predictable 123456 or random
    otp_code = str(random.randint(100000, 999999))
    # For demo ease, also accept "123456" as universal test OTP
    store.otps[phone] = {
        "otp": otp_code,
        "role": data.role,
        "expires_at": datetime.now() + timedelta(minutes=5)
    }

    # Attempt to send via Brevo (if configured)
    send_brevo_sms_otp(phone, otp_code)

    return SendOTPResponse(
        success=True,
        message=f"OTP successfully dispatched to {phone}",
        mobile=phone,
        cooldown_seconds=30,
        dev_otp=otp_code # Included for seamless testing during local development
    )

@router.post("/verify-otp", response_model=AuthResponse)
def verify_otp(data: VerifyOTPRequest):
    phone = normalize_phone(data.mobile)
    stored = store.otps.get(phone)

    # Validate OTP (allows generated dev OTP or universal dev bypass '123456')
    if not stored and data.otp != "123456":
        raise HTTPException(status_code=400, detail="OTP expired or never requested. Please request a new OTP.")

    if stored and stored["otp"] != data.otp and data.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please enter the 6-digit code received.")

    # Find existing user profile with this phone and role
    matched_profile = None
    for p in store.profiles.values():
        if normalize_phone(p.get("phone", "")) == phone and p.get("role") == data.role:
            matched_profile = p
            break

    if not matched_profile:
        # Check if user exists with another role to warn user
        other_role = next((p.get("role") for p in store.profiles.values() if normalize_phone(p.get("phone", "")) == phone), None)
        if other_role:
            raise HTTPException(
                status_code=400,
                detail=f"This mobile is registered as a {other_role}. Please use the {other_role.capitalize()} portal or register with a new account."
            )
        raise HTTPException(
            status_code=404,
            detail="Account not found with this mobile number. Please click Register to create your account."
        )

    # Generate session token
    token = f"fb_sess_{uuid.uuid4().hex}"
    active_sessions[token] = matched_profile["id"]

    # If farmer, attach farm info
    farm = None
    if matched_profile["role"] == "farmer":
        farm = next((f for f in store.farms.values() if f.get("owner_id") == matched_profile["id"]), None)

    return AuthResponse(
        token=token,
        profile=ProfileResponse(**matched_profile),
        farm=FarmResponse(**farm) if farm else None
    )

@router.post("/farmer/register", response_model=AuthResponse)
def register_farmer(data: FarmerRegisterRequest):
    phone = normalize_phone(data.mobile)

    # Verify OTP
    stored = store.otps.get(phone)
    if not stored and data.otp != "123456":
        raise HTTPException(status_code=400, detail="Please request OTP first before registering.")
    if stored and stored["otp"] != data.otp and data.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP code.")

    # Check if already registered
    for p in store.profiles.values():
        if normalize_phone(p.get("phone", "")) == phone:
            raise HTTPException(status_code=400, detail="Mobile number is already registered. Please Login instead.")

    # Create Farmer Profile
    farmer_id = str(uuid.uuid4())
    profile_data = {
        "id": farmer_id,
        "role": "farmer",
        "display_name": data.display_name,
        "phone": phone,
        "email": f"farmer_{farmer_id[:8]}@demo.farmbridge.in",
        "preferred_language": data.preferred_language,
        "avatar_path": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop",
        "verification_status": "verified",
        "default_latitude": data.latitude,
        "default_longitude": data.longitude,
        "default_address": data.farm_address,
        "created_at": datetime.now()
    }
    store.profiles[farmer_id] = profile_data

    # Create Farm with accurate GPS coordinates & accuracy metadata
    farm_id = str(uuid.uuid4())
    farm_data = {
        "id": farm_id,
        "owner_id": farmer_id,
        "owner_name": data.display_name,
        "farm_name": data.farm_name,
        "description": data.description or f"Natural harvest grove managed by {data.display_name}",
        "region": data.village or "Pollachi",
        "village": data.village or "Pollachi Rural",
        "district": data.district or "Coimbatore",
        "state": data.state or "Tamil Nadu",
        "pincode": data.pincode or "642001",
        "farm_address": data.farm_address,
        "latitude": data.latitude,
        "longitude": data.longitude,
        "gps_accuracy": data.gps_accuracy,
        "is_approximate": data.is_approximate,
        "pickup_instructions": data.pickup_instructions or "Pickup at farm gate shelter.",
        "is_active": True,
        "created_at": datetime.now()
    }
    store.farms[farm_id] = farm_data

    # Generate session token
    token = f"fb_sess_{uuid.uuid4().hex}"
    active_sessions[token] = farmer_id

    return AuthResponse(
        token=token,
        profile=ProfileResponse(**profile_data),
        farm=FarmResponse(**farm_data)
    )

@router.post("/consumer/register", response_model=AuthResponse)
def register_consumer(data: ConsumerRegisterRequest):
    phone = normalize_phone(data.mobile)

    # Verify OTP
    stored = store.otps.get(phone)
    if not stored and data.otp != "123456":
        raise HTTPException(status_code=400, detail="Please request OTP first before registering.")
    if stored and stored["otp"] != data.otp and data.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP code.")

    # Check if already registered
    for p in store.profiles.values():
        if normalize_phone(p.get("phone", "")) == phone:
            raise HTTPException(status_code=400, detail="Mobile number is already registered. Please Login instead.")

    # Default to Pollachi Central coordinates if geolocation was skipped
    lat = data.latitude if data.latitude is not None else 10.6580
    lon = data.longitude if data.longitude is not None else 77.0080

    consumer_id = str(uuid.uuid4())
    profile_data = {
        "id": consumer_id,
        "role": "consumer",
        "display_name": data.display_name,
        "phone": phone,
        "email": f"consumer_{consumer_id[:8]}@demo.farmbridge.in",
        "preferred_language": data.preferred_language,
        "avatar_path": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop",
        "verification_status": "verified",
        "default_latitude": lat,
        "default_longitude": lon,
        "default_address": data.delivery_address,
        "created_at": datetime.now()
    }
    store.profiles[consumer_id] = profile_data

    token = f"fb_sess_{uuid.uuid4().hex}"
    active_sessions[token] = consumer_id

    return AuthResponse(
        token=token,
        profile=ProfileResponse(**profile_data),
        farm=None
    )

@router.post("/supabase-sync", response_model=AuthResponse)
def supabase_sync(
    data: SupabaseSyncRequest,
    authorization: Optional[str] = Header(None)
):
    # 1. Search existing profile by Supabase ID
    matched_profile = store.profiles.get(data.supabase_id)

    # 2. If not found by ID, search by email to avoid duplicate consumer accounts
    if not matched_profile and data.email:
        clean_email = data.email.strip().lower()
        for p in store.profiles.values():
            if p.get("email") and p.get("email").strip().lower() == clean_email:
                matched_profile = p
                break

    # 3. If still not found, create new consumer profile
    if not matched_profile:
        name = (
            data.display_name
            or (data.email.split("@")[0].capitalize() if data.email else "FarmBridge Consumer")
        )
        matched_profile = {
            "id": data.supabase_id,
            "role": "consumer",
            "display_name": name,
            "phone": None,
            "email": data.email or None,
            "preferred_language": "en",
            "avatar_path": data.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop",
            "verification_status": "verified",
            "default_latitude": 10.6609,
            "default_longitude": 77.0048,
            "default_address": "Pollachi Central, Tamil Nadu",
            "created_at": datetime.now()
        }
        store.profiles[data.supabase_id] = matched_profile
    else:
        # If found by email with a different key, ensure supabase_id also resolves to this profile
        if matched_profile.get("id") != data.supabase_id:
            store.profiles[data.supabase_id] = matched_profile
        # Update avatar or display name if missing
        if data.avatar_url and not matched_profile.get("avatar_path"):
            matched_profile["avatar_path"] = data.avatar_url
        if data.display_name and (not matched_profile.get("display_name") or matched_profile.get("display_name") == "FarmBridge Consumer"):
            matched_profile["display_name"] = data.display_name

    if data.profile_id:
        store.profiles[data.profile_id] = matched_profile
        active_sessions[data.profile_id] = matched_profile["id"]
    matched_profile["supabase_auth_id"] = data.supabase_id

    # Create session token and map in active_sessions
    token = f"fb_sess_{uuid.uuid4().hex}"
    active_sessions[token] = matched_profile["id"]
    active_sessions[data.supabase_id] = matched_profile["id"]

    # Also map Supabase JWT if passed
    if authorization and authorization.startswith("Bearer "):
        supa_token = authorization.split(" ")[1]
        active_sessions[supa_token] = matched_profile["id"]

    return AuthResponse(
        token=token,
        profile=ProfileResponse(**matched_profile),
        farm=None
    )


@router.post("/supabase-farmer-sync", response_model=AuthResponse)
def supabase_farmer_sync(
    data: SupabaseSyncRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Farmer-specific Supabase OAuth/session sync endpoint.

    Rules:
    - If the Supabase user already has a farmer profile → return it (any verification_status).
    - If the Supabase user has a CONSUMER profile → raise 403 (wrong role).
    - If no profile exists → create a new farmer profile with verification_status='pending'.
      The frontend FarmerAuthContext will see 'pending' and show the pending-verification screen.
    - Verified farmers (verification_status='verified') get full dashboard access.

    This endpoint NEVER elevates a consumer account to farmer role. That would be a security violation.
    """
    # 1. Search by Supabase ID
    matched_profile = store.profiles.get(data.supabase_id)

    # 2. Search by email if not found by ID
    if not matched_profile and data.email:
        clean_email = data.email.strip().lower()
        for p in store.profiles.values():
            if p.get("email") and p.get("email").strip().lower() == clean_email:
                matched_profile = p
                break

    # 3. Existing profile found — check role
    is_demo = settings.DEBUG or settings.ENVIRONMENT in ("development", "demo")
    if matched_profile:
        role = matched_profile.get("role")
        if role != "farmer":
            # Consumer or other role signed into farmer portal → reject
            raise HTTPException(
                status_code=403,
                detail=f"This account is registered as a '{role}', not as a farmer. Please use the correct portal."
            )
        # In demo environment, auto-verify farmer accounts so they don't get stuck on approval screen
        if is_demo and matched_profile.get("verification_status") in ("pending", "not_submitted"):
            matched_profile["verification_status"] = "verified"

        # Ensure supabase_id maps to this profile
        if matched_profile.get("id") != data.supabase_id:
            store.profiles[data.supabase_id] = matched_profile
        # Update metadata
        if data.avatar_url and not matched_profile.get("avatar_path"):
            matched_profile["avatar_path"] = data.avatar_url
        if data.display_name and not matched_profile.get("display_name"):
            matched_profile["display_name"] = data.display_name

    else:
        # 4. No existing profile → create a new farmer profile
        name = (
            data.display_name
            or (data.email.split("@")[0].replace(".", " ").title() if data.email else "New Farmer")
        )
        default_status = "verified" if is_demo else "pending"
        matched_profile = {
            "id": data.supabase_id,
            "role": "farmer",
            "display_name": name,
            "phone": None,
            "email": data.email or None,
            "preferred_language": "en",
            "avatar_path": data.avatar_url or "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop",
            "verification_status": default_status,
            "default_latitude": 10.5982,   # Pollachi / Aliyar area default
            "default_longitude": 76.9721,
            "default_address": "Pollachi, Tamil Nadu",
            "onboarding_completed": False,
            "created_at": datetime.now()
        }
        store.profiles[data.supabase_id] = matched_profile

    if data.profile_id:
        store.profiles[data.profile_id] = matched_profile
        active_sessions[data.profile_id] = matched_profile["id"]
    matched_profile["supabase_auth_id"] = data.supabase_id

    # Issue session token
    token = f"fb_sess_{uuid.uuid4().hex}"
    active_sessions[token] = matched_profile["id"]
    active_sessions[data.supabase_id] = matched_profile["id"]

    if authorization and authorization.startswith("Bearer "):
        supa_token = authorization.split(" ")[1]
        active_sessions[supa_token] = matched_profile["id"]

    # Attach farm if farmer is verified and has one
    farm = None
    if matched_profile.get("verification_status") == "verified":
        farm = next(
            (f for f in store.farms.values() if f.get("owner_id") == matched_profile["id"]),
            None
        )

    return AuthResponse(
        token=token,
        profile=ProfileResponse(**matched_profile),
        farm=FarmResponse(**farm) if farm else None
    )



@router.get("/me", response_model=ProfileResponse)
def get_current_user(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    uid = get_current_user_id(authorization, x_user_id, allow_fallback=False)
    if not uid or uid not in store.profiles:
        raise HTTPException(status_code=401, detail="Unauthenticated")
    return store.profiles[uid]

@router.post("/logout")
def logout(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        active_sessions.pop(token, None)
    if x_user_id:
        active_sessions.pop(x_user_id, None)
    return {"success": True, "message": "Logged out successfully"}
