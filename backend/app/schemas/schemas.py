from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime, date

class RoleEnum(str, Enum):
    FARMER = "farmer"
    CONSUMER = "consumer"
    BUSINESS = "business"
    DELIVERY = "delivery"
    ADMIN = "admin"

class OrderStatusEnum(str, Enum):
    CART = "cart"
    PENDING_CONFIRMATION = "pending_farmer_confirmation"
    ACCEPTED = "accepted"
    PREPARING = "preparing"
    READY_FOR_PICKUP = "ready_for_pickup"
    PICKED_UP = "picked_up"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    PAYMENT_FAILED = "payment_failed"
    REFUND_PENDING = "refund_pending"
    REFUNDED = "refunded"
    DELIVERY_FAILED = "delivery_failed"
    DISPUTED = "disputed"

class FulfilmentTypeEnum(str, Enum):
    PICKUP = "pickup"
    DELIVERY = "delivery"
    COLLECTION_POINT = "collection_point"

# --- AUTH & OTP SCHEMAS ---
class SendOTPRequest(BaseModel):
    mobile: str = Field(..., description="Mobile number with or without +91")
    role: RoleEnum = RoleEnum.CONSUMER
    purpose: str = "login" # "login" or "register"

class SendOTPResponse(BaseModel):
    success: bool
    message: str
    mobile: str
    cooldown_seconds: int = 30
    dev_otp: Optional[str] = None # Displayed in local dev mode when SMS gateway unconfigured

class VerifyOTPRequest(BaseModel):
    mobile: str
    otp: str
    role: RoleEnum

class FarmerRegisterRequest(BaseModel):
    display_name: str
    mobile: str
    otp: str
    farm_name: str
    description: Optional[str] = None
    farm_address: str
    village: Optional[str] = None
    district: str = "Coimbatore"
    state: str = "Tamil Nadu"
    pincode: str = "642001"
    latitude: float
    longitude: float
    gps_accuracy: Optional[float] = None
    is_approximate: bool = False
    preferred_language: str = "en"
    pickup_instructions: Optional[str] = None

class ConsumerRegisterRequest(BaseModel):
    display_name: str
    mobile: str
    otp: str
    delivery_address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    gps_accuracy: Optional[float] = None
    preferred_language: str = "en"

class SupabaseSyncRequest(BaseModel):
    supabase_id: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None

class AuthResponse(BaseModel):
    token: str
    profile: "ProfileResponse"
    farm: Optional["FarmResponse"] = None

# --- PROFILES ---
class ProfileBase(BaseModel):
    display_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    role: RoleEnum
    preferred_language: str = "en"

class ProfileResponse(ProfileBase):
    id: str
    avatar_path: Optional[str] = None
    verification_status: str
    default_latitude: Optional[float] = None
    default_longitude: Optional[float] = None
    default_address: Optional[str] = None
    created_at: datetime

# --- FARMS & GEOLOCATION ---
class FarmBase(BaseModel):
    farm_name: str
    description: Optional[str] = None
    region: str = "Pollachi"
    village: Optional[str] = None
    district: str = "Coimbatore"
    state: str = "Tamil Nadu"
    pincode: str = "642001"
    farm_address: Optional[str] = None
    latitude: float
    longitude: float
    gps_accuracy: Optional[float] = None
    is_approximate: bool = False

class FarmCreate(FarmBase):
    pickup_instructions: Optional[str] = None

class FarmResponse(FarmBase):
    id: str
    owner_id: str
    owner_name: Optional[str] = None
    pickup_instructions: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    distance_km: Optional[float] = None
    products_count: Optional[int] = 0

class FarmLocationUpdate(BaseModel):
    latitude: float
    longitude: float
    gps_accuracy: Optional[float] = None
    is_approximate: bool = False
    farm_address: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    pincode: Optional[str] = None

# --- CATEGORIES ---
class CategoryResponse(BaseModel):
    id: str
    name: str
    name_ta: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool = True

# --- PRODUCTS ---
class ProductBase(BaseModel):
    name: str
    name_ta: Optional[str] = None
    category_id: Optional[str] = None
    description: Optional[str] = None
    image_paths: List[str] = []
    price: float = Field(..., ge=0.01)
    unit: str = "kg"
    available_quantity: float = Field(..., ge=0.0)
    minimum_order_quantity: float = Field(default=1.0, gt=0)
    maximum_order_quantity: Optional[float] = None
    availability_date: Optional[date] = None
    harvest_date: Optional[date] = None
    fulfilment_options: List[str] = ["pickup", "delivery"]

class ProductCreate(ProductBase):
    latitude: Optional[float] = None # Defaults to farm latitude
    longitude: Optional[float] = None # Defaults to farm longitude

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    name_ta: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0.01)
    available_quantity: Optional[float] = Field(None, ge=0.0)
    unit: Optional[str] = None
    status: Optional[str] = None
    fulfilment_options: Optional[List[str]] = None
    image_paths: Optional[List[str]] = None

class ProductResponse(ProductBase):
    id: str
    farmer_id: str
    farm_id: str
    farm_name: Optional[str] = None
    farmer_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    distance_km: Optional[float] = None
    status: str
    created_at: datetime
    updated_at: datetime

# --- CART ---
class CartItemCreate(BaseModel):
    product_id: str
    quantity: float = Field(..., gt=0)

class CartItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    unit: str
    unit_price: float
    quantity: float
    line_total: float
    available_stock: float
    farmer_id: str
    farm_name: str
    farm_distance_km: Optional[float] = None
    image_url: Optional[str] = None

class CartResponse(BaseModel):
    items: List[CartItemResponse]
    subtotal: float
    delivery_fee: float
    platform_fee: float
    total: float
    farmer_id: Optional[str] = None
    farmer_name: Optional[str] = None

# --- ORDERS ---
class OrderCreate(BaseModel):
    fulfilment_type: FulfilmentTypeEnum = FulfilmentTypeEnum.DELIVERY
    delivery_area: Optional[str] = "Pollachi Central"
    delivery_address: Optional[str] = ""
    delivery_contact_phone: Optional[str] = ""
    delivery_slot: Optional[str] = "Morning (7:00 AM - 10:00 AM)"
    notes: Optional[str] = None
    payment_method: str = "demo_pay"
    consumer_latitude: Optional[float] = None
    consumer_longitude: Optional[float] = None

class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    product_name_snapshot: str
    unit_snapshot: str
    unit_price_snapshot: float
    quantity: float
    line_total: float

class OrderEventResponse(BaseModel):
    id: str
    event_type: str
    from_status: Optional[str] = None
    to_status: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime
    actor_role: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    order_number: str
    buyer_id: str
    buyer_name: Optional[str] = None
    farmer_id: str
    farmer_name: Optional[str] = None
    farm_id: str
    farm_name: Optional[str] = None
    status: OrderStatusEnum
    fulfilment_type: FulfilmentTypeEnum
    delivery_area: Optional[str] = None
    delivery_address: Optional[str] = None
    delivery_contact_phone: Optional[str] = None
    delivery_slot: Optional[str] = None
    subtotal: float
    delivery_fee: float
    platform_fee: float
    total_amount: float
    currency: str = "INR"
    payment_status: str
    items: List[OrderItemResponse]
    events: List[OrderEventResponse] = []
    created_at: datetime
    updated_at: datetime

class OrderStatusUpdate(BaseModel):
    status: OrderStatusEnum
    reason: Optional[str] = None

# --- DELIVERY TASKS ---
class DeliveryTaskResponse(BaseModel):
    id: str
    order_id: str
    order_number: str
    delivery_partner_id: Optional[str] = None
    delivery_partner_name: Optional[str] = None
    status: str
    pickup_address: str
    dropoff_address: str
    route_estimate_km: float
    estimated_duration_mins: int
    created_at: datetime
    delivered_time: Optional[datetime] = None

# --- AI & INSIGHTS ---
class PriceReferenceResponse(BaseModel):
    id: str
    crop_name: str
    crop_name_ta: Optional[str] = None
    market_name: str
    region: str
    unit: str
    min_price: float
    modal_price: float
    max_price: float
    source_name: str
    observed_date: str
    notice: str = "Transparent Mandi reference; actual selling price is set entirely at the farmer's discretion."

class PriceEstimateRequest(BaseModel):
    crop_name: str
    quantity: float
    unit: str = "kg"
    farmer_price: float

class PriceEstimateResponse(BaseModel):
    crop_name: str
    unit: str
    proposed_price: float
    reference_modal: float
    price_band: str
    estimated_farmer_earnings: float
    disclosed_platform_fee: float
    note: str

class DemandInsightItem(BaseModel):
    crop_name: str
    crop_name_ta: Optional[str] = None
    category: str
    demand_level: str
    weekly_searches: int
    order_volume: int
    trend: str
    buyer_interest_note: str

# --- ADMIN ---
class AdminOverviewResponse(BaseModel):
    total_users: int
    farmers_count: int
    buyers_count: int
    active_listings: int
    total_orders: int
    completed_orders: int
    gross_merchandise_val: float
    platform_fee_collected: float
    pending_verifications: int
    open_disputes: int

class VerificationDecisionRequest(BaseModel):
    status: str
    note: Optional[str] = None

class DisputeResolveRequest(BaseModel):
    resolution: str
    status: str = "resolved"

# --- REVIEWS ---
class ReviewCreate(BaseModel):
    order_id: str
    rating: int = Field(..., ge=1, le=5)
    review_text: str

class ReviewResponse(BaseModel):
    id: str
    order_id: str
    buyer_id: str
    buyer_name: str
    farmer_id: str
    rating: int
    review_text: str
    created_at: datetime
