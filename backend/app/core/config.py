import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FarmBridge API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("PORT", 8001))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1")
    
    # Supabase / DB (Optional demo fallback)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # Brevo SMS Integration
    BREVO_API_KEY: str = os.getenv("BREVO_API_KEY", "")
    BREVO_SENDER_NAME: str = os.getenv("BREVO_SENDER_NAME", "FarmBr")
    
    # Financial & Pilot Rules
    PLATFORM_FEE_FIXED: float = 5.00 # Transparent flat service fee ₹5
    BASE_DELIVERY_FEE: float = 25.00 # Transparent delivery fee ₹25
    CURRENCY: str = "INR"
    
    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
        extra = "allow"

settings = Settings()
