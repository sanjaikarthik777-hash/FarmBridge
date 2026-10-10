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
def list_orders(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    uid = get_current_user_id(authorization=authorization, x_user_id=x_user_id)
    profile = store.profiles.get(uid)
    role = profile.get("role") if profile else "consumer"

    orders = list(store.orders.values())
    if role == "farmer":
        farmer_ids = {
            uid,
            profile.get("id") if profile else None,
            profile.get("supabase_auth_id") if profile else None,
            "f1000000-0000-0000-0000-000000000001",
            "f2000000-0000-0000-0000-000000000002"
        }
        farmer_ids.discard(None)
        orders = [
            o for o in orders 
            if o.get("farmer_id") in farmer_ids or not o.get("farmer_id")
        ]
    elif role == "consumer" or role == "business":
        buyer_ids = {
            uid,
            profile.get("id") if profile else None,
            profile.get("supabase_auth_id") if profile else None,
            "b1000000-0000-0000-0000-000000000001"
        }
        buyer_ids.discard(None)
        orders = [o for o in orders if o.get("buyer_id") in buyer_ids]
    elif role == "delivery":
        assigned_order_ids = {
            t["order_id"] for t in store.delivery_tasks.values() if t.get("delivery_partner_id") == uid
        }
        orders = [o for o in orders if o["id"] in assigned_order_ids or o["fulfilment_type"] == "delivery"]
    # Admin sees all orders

    # Sort newest first
    orders.sort(key=lambda x: str(x["created_at"]), reverse=True)
    return orders

@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: str,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    if order_id not in store.orders:
        raise HTTPException(status_code=404, detail="Order not found")
    order = store.orders[order_id]
    uid = get_current_user_id(authorization=authorization, x_user_id=x_user_id)
    profile = store.profiles.get(uid)
    role = profile.get("role") if profile else "consumer"

    # Authorization
    farmer_ids = {
        uid,
        profile.get("id") if profile else None,
        profile.get("supabase_auth_id") if profile else None,
        "f1000000-0000-0000-0000-000000000001",
        "f2000000-0000-0000-0000-000000000002"
    }
    farmer_ids.discard(None)
    if role not in ("admin", "delivery") and order.get("buyer_id") != uid and order.get("farmer_id") not in farmer_ids:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")

    return order

@router.post("/orders", response_model=OrderResponse)
def create_order(
    data: OrderCreate,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    """
    Creates order with authoritative calculation, persistent storage, and stock decrement.
    Supports either pre-populated cart items or items passed directly in the payload.
    """
    uid = get_current_user_id(authorization=authorization, x_user_id=x_user_id)
    buyer = store.profiles.get(uid) or (store.profiles.get(data.buyer_id) if data.buyer_id else None)
    if not buyer:
        buyer_id = data.buyer_id or uid or f"b-{uuid.uuid4().hex[:8]}"
        buyer = {
            "id": buyer_id,
            "display_name": "Consumer",
            "role": "consumer",
            "phone": data.delivery_contact_phone or "+91 97890 00000",
            "created_at": datetime.now()
        }
        store.profiles[buyer_id] = buyer
        uid = buyer_id

    # Determine items: prioritize items explicitly provided in body
    if data.items and len(data.items) > 0:
        cart_items = data.items
    else:
        cart_items = store.carts.get(uid, [])

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order_items_data: List[dict] = []
    subtotal = 0.0
    farmer_id = data.farmer_id
    farm_id = data.farm_id
    farm_name = data.farm_name
    farmer_name = data.farmer_name

    for item in cart_items:
        pid = item.get("product_id")
        prod = store.products.get(pid)
        p_name = item.get("product_name") or item.get("product_name_snapshot") or (prod["name"] if prod else "Fresh Produce")
        p_unit = item.get("unit") or item.get("unit_snapshot") or (prod["unit"] if prod else "kg")
        p_price = float(item.get("unit_price") or item.get("unit_price_snapshot") or item.get("price") or (prod["price"] if prod else 30.0))
        p_qty = float(item.get("quantity", 1))
        p_line = round(p_price * p_qty, 2)
        subtotal += p_line

        if not farmer_id:
            farmer_id = item.get("farmer_id") or (prod.get("farmer_id") if prod else "f1000000-0000-0000-0000-000000000001")
        if not farm_id:
            farm_id = item.get("farm_id") or (prod.get("farm_id") if prod else "fa111111-1111-1111-1111-111111111111")
        if not farm_name:
            farm_name = item.get("farm_name") or (prod.get("farm_name") if prod else "Thennam Thoppu Natural Farm")
        if not farmer_name:
            farmer_name = item.get("farmer_name") or (prod.get("farmer_name") if prod else "Murugan Palanisamy")

        # Atomic stock decrement if product is tracked in store
        if prod and "available_quantity" in prod:
            prod["available_quantity"] = max(0.0, round(prod["available_quantity"] - p_qty, 2))
            if prod["available_quantity"] <= 0:
                prod["status"] = "sold_out"

        order_items_data.append({
            "id": item.get("id") or f"oi-{uuid.uuid4().hex[:8]}",
            "product_id": pid or str(uuid.uuid4()),
            "product_name_snapshot": p_name,
            "unit_snapshot": p_unit,
            "unit_price_snapshot": p_price,
            "quantity": p_qty,
            "line_total": p_line
        })

    subtotal = round(subtotal, 2)
    delivery_fee = data.delivery_fee if data.delivery_fee is not None else (settings.BASE_DELIVERY_FEE if data.fulfilment_type == "delivery" else 0.0)
    platform_fee = data.platform_fee if data.platform_fee is not None else settings.PLATFORM_FEE_FIXED
    total_amount = round(subtotal + delivery_fee + platform_fee, 2)

    oid = f"o-{uuid.uuid4().hex[:8]}"
    order_num = f"FB-{datetime.now().year}-{len(store.orders) + 101:03d}"
    now = datetime.now()

    new_order = {
        "id": oid,
        "order_number": order_num,
        "buyer_id": buyer.get("id", uid),
        "buyer_name": buyer.get("display_name", "Consumer"),
        "farmer_id": farmer_id or "f1000000-0000-0000-0000-000000000001",
        "farmer_name": farmer_name or "Murugan Palanisamy",
        "farm_id": farm_id or "fa111111-1111-1111-1111-111111111111",
        "farm_name": farm_name or "Thennam Thoppu Natural Farm",
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
        "payment_status": "simulated_paid",
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
    store.save_orders()

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
def accept_order(
    order_id: str,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    if order_id not in store.orders:
        raise HTTPException(status_code=404, detail="Order not found")
    order = store.orders[order_id]
    uid = get_current_user_id(authorization=authorization, x_user_id=x_user_id)
    p = store.profiles.get(uid)
    farmer_ids = {
        uid,
        p.get("id") if p else None,
        p.get("supabase_auth_id") if p else None,
        "f1000000-0000-0000-0000-000000000001",
        "f2000000-0000-0000-0000-000000000002"
    }
    farmer_ids.discard(None)
    is_farmer_or_admin = (p and p.get("role") in ("farmer", "admin")) or order.get("farmer_id") in farmer_ids
    if not is_farmer_or_admin:
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
    store.save_orders()
    return order

@router.post("/orders/{order_id}/reject", response_model=OrderResponse)
def reject_order(
    order_id: str,
    reason: str = "Produce unavailable due to weather",
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    if order_id not in store.orders:
        raise HTTPException(status_code=404, detail="Order not found")
    order = store.orders[order_id]
    uid = get_current_user_id(authorization=authorization, x_user_id=x_user_id)
    p = store.profiles.get(uid)
    farmer_ids = {
        uid,
        p.get("id") if p else None,
        p.get("supabase_auth_id") if p else None,
        "f1000000-0000-0000-0000-000000000001",
        "f2000000-0000-0000-0000-000000000002"
    }
    farmer_ids.discard(None)
    is_farmer_or_admin = (p and p.get("role") in ("farmer", "admin")) or order.get("farmer_id") in farmer_ids
    if not is_farmer_or_admin:
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
    store.save_orders()
    return order

@router.post("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    data: OrderStatusUpdate,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    if order_id not in store.orders:
        raise HTTPException(status_code=404, detail="Order not found")
    order = store.orders[order_id]
    uid = get_current_user_id(authorization=authorization, x_user_id=x_user_id)
    actor = store.profiles.get(uid, {"role": "system"})

    prev_status = order["status"]
    order["status"] = data.status
    order["events"].append({
        "id": f"ev-{uuid.uuid4().hex[:8]}",
        "event_type": f"status_change_{data.status}",
        "from_status": prev_status,
        "to_status": data.status,
        "note": data.rejection_reason or f"Order advanced to {data.status}",
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

    store.save_orders()
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
