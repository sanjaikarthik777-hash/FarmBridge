from fastapi import APIRouter, HTTPException, Header
from typing import List, Optional
import uuid
from datetime import datetime
from app.services.demo_seed import store
from app.schemas.schemas import (
    OrderResponse, OrderCreate, OrderStatusUpdate, OrderStatusEnum,
    OrderItemResponse, OrderEventResponse, ReviewCreate, ReviewResponse
)
from app.api.auth import get_current_user_id
from app.core.config import settings

router = APIRouter(tags=["Orders & Reviews"])

@router.get("/orders", response_model=List[OrderResponse])
def list_orders(x_user_id: Optional[str] = Header(None)):
    uid = get_current_user_id(x_user_id)
    profile = store.profiles.get(uid)
    role = profile.get("role") if profile else "consumer"

    orders = list(store.orders.values())
    if role == "farmer":
        orders = [o for o in orders if o["farmer_id"] == uid]
    elif role == "consumer" or role == "business":
        orders = [o for o in orders if o["buyer_id"] == uid]
    elif role == "delivery":
        # Orders assigned to delivery tasks for this partner
        assigned_order_ids = {
            t["order_id"] for t in store.delivery_tasks.values() if t.get("delivery_partner_id") == uid
        }
        orders = [o for o in orders if o["id"] in assigned_order_ids or o["fulfilment_type"] == "delivery"]
    # Admin sees all orders

    # Sort newest first
    orders.sort(key=lambda x: x["created_at"], reverse=True)
    return orders

@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, x_user_id: Optional[str] = Header(None)):
    if order_id not in store.orders:
        raise HTTPException(status_code=404, detail="Order not found")
    order = store.orders[order_id]
    uid = get_current_user_id(x_user_id)
    profile = store.profiles.get(uid)
    role = profile.get("role") if profile else "consumer"

    # Authorization
    if role not in ("admin", "delivery") and order["buyer_id"] != uid and order["farmer_id"] != uid:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")

    return order

@router.post("/orders", response_model=OrderResponse)
def create_order(data: OrderCreate, x_user_id: Optional[str] = Header(None)):
    """
    Creates order with authoritative server-side calculation and atomic stock check.
    Prevents overselling.
    """
    uid = get_current_user_id(x_user_id)
    buyer = store.profiles.get(uid)
    if not buyer:
        raise HTTPException(status_code=401, detail="User profile required")

    cart_items = store.carts.get(uid, [])
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Authoritative server-side stock and price recheck
    order_items_data: List[dict] = []
    subtotal = 0.0
    farmer_id = None
    farm_id = None
    farm_name = None
    farmer_name = None

    for item in cart_items:
        prod = store.products.get(item["product_id"])
        if not prod:
            raise HTTPException(status_code=400, detail="An item in your cart is no longer available")

        if prod["status"] != "active":
            raise HTTPException(status_code=400, detail=f"Produce '{prod['name']}' is no longer active")

        if item["quantity"] > prod["available_quantity"]:
            raise HTTPException(
                status_code=400,
                detail=f"Requested {item['quantity']} {prod['unit']} of {prod['name']}, but only {prod['available_quantity']} is available"
            )

        farmer_id = prod["farmer_id"]
        farm_id = prod["farm_id"]
        farm_name = prod.get("farm_name", "Local Farm")
        farmer_name = prod.get("farmer_name", "Local Farmer")

        line_tot = round(prod["price"] * item["quantity"], 2)
        subtotal += line_tot

        order_items_data.append({
            "id": f"oi-{uuid.uuid4().hex[:8]}",
            "product_id": prod["id"],
            "product_name_snapshot": prod["name"],
            "unit_snapshot": prod["unit"],
            "unit_price_snapshot": prod["price"],
            "quantity": item["quantity"],
            "line_total": line_tot
        })

    subtotal = round(subtotal, 2)
    delivery_fee = settings.BASE_DELIVERY_FEE if data.fulfilment_type == "delivery" else 0.0
    platform_fee = settings.PLATFORM_FEE_FIXED
    total_amount = round(subtotal + delivery_fee + platform_fee, 2)

    # Atomic stock decrement
    for item in cart_items:
        prod = store.products[item["product_id"]]
        prod["available_quantity"] = round(prod["available_quantity"] - item["quantity"], 2)
        if prod["available_quantity"] <= 0:
            prod["status"] = "sold_out"

    # Create Order
    oid = f"o-{uuid.uuid4().hex[:8]}"
    order_num = f"FB-2026-{len(store.orders) + 1:03d}"
    now = datetime.now()

    new_order = {
        "id": oid,
        "order_number": order_num,
        "buyer_id": uid,
        "buyer_name": buyer["display_name"],
        "farmer_id": farmer_id,
        "farmer_name": farmer_name,
        "farm_id": farm_id,
        "farm_name": farm_name,
        "status": OrderStatusEnum.PENDING_CONFIRMATION,
        "fulfilment_type": data.fulfilment_type,
        "delivery_area": data.delivery_area or "Pollachi Town",
        "delivery_address": data.delivery_address or ("Farm Pickup" if data.fulfilment_type == "pickup" else "Pollachi"),
        "delivery_contact_phone": data.delivery_contact_phone or buyer.get("phone", "+91 97890 00000"),
        "delivery_slot": data.delivery_slot or "Morning (7:00 AM - 10:00 AM)",
        "subtotal": subtotal,
        "delivery_fee": delivery_fee,
        "platform_fee": platform_fee,
        "total_amount": total_amount,
        "currency": "INR",
        "payment_status": "simulated_paid", # Transparent mock transaction
        "items": order_items_data,
        "events": [
            {
                "id": f"ev-{uuid.uuid4().hex[:8]}",
                "event_type": "order_placed",
                "from_status": None,
                "to_status": OrderStatusEnum.PENDING_CONFIRMATION,
                "note": f"Order confirmed with simulated {data.payment_method}. Transparent fee: ₹{platform_fee}",
                "created_at": now,
                "actor_role": buyer.get("role", "consumer")
            }
        ],
        "created_at": now,
        "updated_at": now
    }

    store.orders[oid] = new_order
    # Empty buyer cart after successful order creation
    store.carts[uid] = []

    # If delivery, auto-assign to delivery task pool
    if data.fulfilment_type == "delivery":
        dt_id = f"dt-{uuid.uuid4().hex[:8]}"
        store.delivery_tasks[dt_id] = {
            "id": dt_id,
            "order_id": oid,
            "order_number": order_num,
            "delivery_partner_id": "d1000000-0000-0000-0000-000000000001",
            "delivery_partner_name": "Senthil Velan",
            "status": "assigned",
            "pickup_address": f"{farm_name}, Pollachi",
            "dropoff_address": new_order["delivery_address"],
            "route_estimate_km": 7.2,
            "estimated_duration_mins": 20,
            "created_at": now,
            "delivered_time": None
        }

    return new_order

@router.post("/orders/{order_id}/accept", response_model=OrderResponse)
def accept_order(order_id: str, x_user_id: Optional[str] = Header(None)):
    if order_id not in store.orders:
        raise HTTPException(status_code=404, detail="Order not found")
    order = store.orders[order_id]
    uid = get_current_user_id(x_user_id)
    if order["farmer_id"] != uid:
        # Check admin
        p = store.profiles.get(uid)
        if not p or p.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Only the listing farmer can accept this order")

    order["status"] = OrderStatusEnum.ACCEPTED
    order["events"].append({
        "id": f"ev-{uuid.uuid4().hex[:8]}",
        "event_type": "farmer_accepted",
        "from_status": OrderStatusEnum.PENDING_CONFIRMATION,
        "to_status": OrderStatusEnum.ACCEPTED,
        "note": "Farmer confirmed fresh produce availability and accepted order.",
        "created_at": datetime.now(),
        "actor_role": "farmer"
    })
    order["updated_at"] = datetime.now()
    return order

@router.post("/orders/{order_id}/reject", response_model=OrderResponse)
def reject_order(order_id: str, reason: str = "Produce unavailable due to weather", x_user_id: Optional[str] = Header(None)):
    if order_id not in store.orders:
        raise HTTPException(status_code=404, detail="Order not found")
    order = store.orders[order_id]
    uid = get_current_user_id(x_user_id)
    if order["farmer_id"] != uid:
        raise HTTPException(status_code=403, detail="Only the listing farmer can reject this order")

    # Restore stock
    for item in order["items"]:
        prod = store.products.get(item["product_id"])
        if prod:
            prod["available_quantity"] += item["quantity"]
            if prod["status"] == "sold_out":
                prod["status"] = "active"

    order["status"] = OrderStatusEnum.REJECTED
    order["events"].append({
        "id": f"ev-{uuid.uuid4().hex[:8]}",
        "event_type": "farmer_rejected",
        "from_status": order["status"],
        "to_status": OrderStatusEnum.REJECTED,
        "note": f"Farmer rejected order: {reason}. Refund credited in simulated account.",
        "created_at": datetime.now(),
        "actor_role": "farmer"
    })
    order["updated_at"] = datetime.now()
    return order

@router.post("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: str, data: OrderStatusUpdate, x_user_id: Optional[str] = Header(None)):
    if order_id not in store.orders:
        raise HTTPException(status_code=404, detail="Order not found")
    order = store.orders[order_id]
    uid = get_current_user_id(x_user_id)
    actor = store.profiles.get(uid, {"role": "system"})

    prev_status = order["status"]
    order["status"] = data.status
    order["events"].append({
        "id": f"ev-{uuid.uuid4().hex[:8]}",
        "event_type": f"status_to_{data.status.value}",
        "from_status": prev_status,
        "to_status": data.status,
        "note": data.reason or f"Status updated to {data.status.value}",
        "created_at": datetime.now(),
        "actor_role": actor.get("role", "system")
    })
    order["updated_at"] = datetime.now()

    # If completed, update corresponding delivery task if exists
    if data.status == OrderStatusEnum.COMPLETED or data.status == OrderStatusEnum.DELIVERED:
        for task in store.delivery_tasks.values():
            if task["order_id"] == order_id:
                task["status"] = "delivered"
                task["delivered_time"] = datetime.now()

    return order

# --- REVIEWS ---
@router.get("/reviews", response_model=List[ReviewResponse])
def list_reviews():
    return store.reviews

@router.post("/reviews", response_model=ReviewResponse)
def create_review(data: ReviewCreate, x_user_id: Optional[str] = Header(None)):
    uid = get_current_user_id(x_user_id)
    buyer = store.profiles.get(uid)
    if not buyer:
        raise HTTPException(status_code=401, detail="User not found")

    order = store.orders.get(data.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order["status"] != OrderStatusEnum.COMPLETED and order["status"] != OrderStatusEnum.DELIVERED:
        raise HTTPException(status_code=400, detail="Reviews can only be submitted for completed orders")

    if order["buyer_id"] != uid:
        raise HTTPException(status_code=403, detail="You can only review your own order")

    # Check for existing review
    for r in store.reviews:
        if r["order_id"] == data.order_id and r["buyer_id"] == uid:
            raise HTTPException(status_code=400, detail="You have already reviewed this order")

    rev_id = f"rev-{uuid.uuid4().hex[:8]}"
    new_rev = {
        "id": rev_id,
        "order_id": data.order_id,
        "buyer_id": uid,
        "buyer_name": buyer["display_name"],
        "farmer_id": order["farmer_id"],
        "rating": data.rating,
        "review_text": data.review_text,
        "created_at": datetime.now()
    }
    store.reviews.insert(0, new_rev)
    return new_rev
