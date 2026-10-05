from fastapi import APIRouter, HTTPException, Header, Body
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime
from app.services.demo_seed import store
from app.api.auth import get_current_user_id

router = APIRouter(prefix="/consumer", tags=["Consumer Portal API"])

# Ensure collections exist on store
if not hasattr(store, "wishlists"):
    store.wishlists = {
        "b1000000-0000-0000-0000-000000000001": ["p1", "p2"]
    }
if not hasattr(store, "addresses"):
    store.addresses = {
        "b1000000-0000-0000-0000-000000000001": [
            {
                "id": "addr1",
                "label": "Home",
                "recipient_name": "Kavitha Sundaram",
                "phone": "+91 97890 41235",
                "address_line": "Flat 3B, Sri Krishna Apartments, Venkatesa Colony",
                "area": "Venkatesa Colony, Pollachi",
                "landmark": "Near Municipal Water Tank",
                "pincode": "642001",
                "latitude": 10.6609,
                "longitude": 77.0048,
                "is_default": True
            },
            {
                "id": "addr2",
                "label": "Parents House",
                "recipient_name": "Sundaram Natarajan",
                "phone": "+91 94432 99881",
                "address_line": "14/2 Palakkad Road, Mahalingapuram",
                "area": "Mahalingapuram, Pollachi",
                "landmark": "Opposite Sub-Collector Office",
                "pincode": "642002",
                "latitude": 10.6550,
                "longitude": 76.9980,
                "is_default": False
            }
        ]
    }
if not hasattr(store, "notifications"):
    store.notifications = {
        "b1000000-0000-0000-0000-000000000001": [
            {
                "id": "n1",
                "title": "Order Confirmed by Farmer",
                "title_ta": "விவசாயி ஆர்டரை உறுதி செய்தார்",
                "message": "Farmer Murugan Palanisamy confirmed order #FB-2026-001. Harvest begins at 6:00 AM.",
                "message_ta": "விவசாயி முருகன் உங்கள் ஆர்டர் #FB-2026-001 ஐ உறுதி செய்தார்.",
                "type": "order",
                "order_id": "o1",
                "is_read": False,
                "created_at": datetime.now().isoformat()
            },
            {
                "id": "n2",
                "title": "Fresh Morning Harvest Alert",
                "title_ta": "புதிய காலை அறுவடை அறிவிப்பு",
                "message": "Anaimalai Organic Valley just listed fresh Red Bananas (செவ்வாழை) 11.9 km from you!",
                "message_ta": "ஆனைமலை இயற்கை பண்ணை புதிய செவ்வாழை பழங்களை பட்டியலிட்டுள்ளது!",
                "type": "harvest",
                "is_read": True,
                "created_at": datetime.now().isoformat()
            }
        ]
    }

# ==========================================
# SAVED ADDRESSES
# ==========================================

@router.get("/addresses")
def get_saved_addresses(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    uid = get_current_user_id(authorization, x_user_id)
    return store.addresses.get(uid, [])

@router.post("/addresses")
def add_saved_address(
    data: Dict[str, Any] = Body(...),
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    uid = get_current_user_id(authorization, x_user_id)
    if uid not in store.addresses:
        store.addresses[uid] = []

    addr_id = f"addr_{uuid.uuid4().hex[:6]}"
    new_addr = {
        "id": addr_id,
        "label": data.get("label", "Home"),
        "recipient_name": data.get("recipient_name", "Valued Customer"),
        "phone": data.get("phone", ""),
        "address_line": data.get("address_line", ""),
        "area": data.get("area", "Pollachi"),
        "landmark": data.get("landmark", ""),
        "pincode": data.get("pincode", "642001"),
        "latitude": data.get("latitude", 10.6609),
        "longitude": data.get("longitude", 77.0048),
        "is_default": data.get("is_default", len(store.addresses[uid]) == 0)
    }

    if new_addr["is_default"]:
        for a in store.addresses[uid]:
            a["is_default"] = False

    store.addresses[uid].append(new_addr)
    return new_addr

@router.patch("/addresses/{address_id}/default")
def set_default_address(
    address_id: str,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    uid = get_current_user_id(authorization, x_user_id)
    user_addrs = store.addresses.get(uid, [])
    found = False
    for a in user_addrs:
        if a["id"] == address_id:
            a["is_default"] = True
            found = True
        else:
            a["is_default"] = False
    if not found:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"success": True, "message": "Default address updated"}

@router.delete("/addresses/{address_id}")
def delete_saved_address(
    address_id: str,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    uid = get_current_user_id(authorization, x_user_id)
    if uid in store.addresses:
        store.addresses[uid] = [a for a in store.addresses[uid] if a["id"] != address_id]
    return {"success": True, "message": "Address deleted"}

# ==========================================
# WISHLIST
# ==========================================

@router.get("/wishlist")
def get_wishlist(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    uid = get_current_user_id(authorization, x_user_id)
    prod_ids = store.wishlists.get(uid, [])
    products = [store.products[pid] for pid in prod_ids if pid in store.products]
    return {
        "product_ids": prod_ids,
        "products": products
    }

@router.post("/wishlist/{product_id}")
def add_to_wishlist(
    product_id: str,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    uid = get_current_user_id(authorization, x_user_id)
    if uid not in store.wishlists:
        store.wishlists[uid] = []
    if product_id not in store.wishlists[uid]:
        store.wishlists[uid].append(product_id)
    return {"success": True, "wishlist": store.wishlists[uid]}

@router.delete("/wishlist/{product_id}")
def remove_from_wishlist(
    product_id: str,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    uid = get_current_user_id(authorization, x_user_id)
    if uid in store.wishlists:
        store.wishlists[uid] = [pid for pid in store.wishlists[uid] if pid != product_id]
    return {"success": True, "wishlist": store.wishlists.get(uid, [])}

# ==========================================
# IN-APP NOTIFICATIONS
# ==========================================

@router.get("/notifications")
def get_notifications(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    uid = get_current_user_id(authorization, x_user_id)
    return store.notifications.get(uid, [])

@router.post("/notifications/read-all")
def mark_notifications_read(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    uid = get_current_user_id(authorization, x_user_id)
    if uid in store.notifications:
        for n in store.notifications[uid]:
            n["is_read"] = True
    return {"success": True}
