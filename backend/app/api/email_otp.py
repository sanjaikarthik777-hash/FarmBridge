from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import random
import httpx
from datetime import datetime, timedelta
from app.core.config import settings

router = APIRouter(prefix="/email-otp", tags=["Email OTP 2FA"])

# In-memory stores for demo
# session_token -> bool
verified_sessions: dict[str, bool] = {}
# email -> { "otp": str, "expires_at": datetime }
otp_store: dict[str, dict] = {}

class SendEmailOtpRequest(BaseModel):
    email: str

class VerifyEmailOtpRequest(BaseModel):
    email: str
    otp: str
    session_token: str

class CheckVerifiedRequest(BaseModel):
    session_token: str

def send_brevo_email(to_email: str, otp: str):
    if not settings.BREVO_API_KEY:
        print("BREVO_API_KEY not set. Skipping real Email sending.")
        return False
        
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": settings.BREVO_API_KEY
    }
    payload = {
        "sender": {"name": settings.BREVO_SENDER_NAME, "email": "mukeshrajasekar933@gmail.com"},
        "to": [{"email": to_email}],
        "subject": "Your FarmBridge Login OTP",
        "htmlContent": f"<p>Your 6-digit OTP for FarmBridge is: <strong>{otp}</strong>.</p><p>It is valid for 5 minutes. Do not share this with anyone.</p>"
    }
    try:
        with httpx.Client() as client:
            response = client.post(url, json=payload, headers=headers, timeout=5.0)
            response.raise_for_status()
            print(f"Brevo Email sent successfully to {to_email}")
            return True
    except Exception as e:
        print(f"Failed to send Brevo Email: {e}")
        return False

@router.post("/send")
def send_email_otp(data: SendEmailOtpRequest):
    email = data.email.strip().lower()
    otp_code = str(random.randint(100000, 999999))
    
    otp_store[email] = {
        "otp": otp_code,
        "expires_at": datetime.now() + timedelta(minutes=5)
    }
    
    print(f"\n=========================================")
    print(f"🚀 OTP FOR {email} IS: {otp_code}")
    print(f"=========================================\n")
    
    send_brevo_email(email, otp_code)
    
    return {"success": True, "message": "OTP sent to email"}

@router.post("/verify")
def verify_email_otp(data: VerifyEmailOtpRequest):
    email = data.email.strip().lower()
    stored = otp_store.get(email)
    
    if not stored:
        raise HTTPException(status_code=400, detail="OTP expired or not requested.")
        
    if datetime.now() > stored["expires_at"]:
        del otp_store[email]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")
        
    if stored["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP. Please try again.")
        
    # Mark session as verified
    verified_sessions[data.session_token] = True
    del otp_store[email] # Prevent reuse
    
    return {"success": True, "message": "OTP verified successfully"}

@router.post("/check")
def check_verified(data: CheckVerifiedRequest):
    is_verified = verified_sessions.get(data.session_token, False)
    return {"verified": is_verified}
