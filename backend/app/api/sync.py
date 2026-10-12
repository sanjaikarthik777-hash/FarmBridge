from fastapi import APIRouter, HTTPException, Header
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from pydantic import BaseModel
from app.services.demo_seed import store
from app.core.config import settings

router = APIRouter(prefix="/sync", tags=["Offline Auto-Sync Engine"])

class SyncItemOrderUpdate(BaseModel):
    id: str
    status: str
    notes: Optional[str] = None
    updated_at: Optional[str] = None

class SyncFarmerBatchRequest(BaseModel):
    farmer_id: Optional[str] = "f1000000-0000-0000-0000-000000000001"
    farm_name: Optional[str] = "Thennam Thoppu Natural Farm"
    last_synced_at: Optional[str] = None
    products: Optional[List[Dict[str, Any]]] = []
    order_updates: Optional[List[SyncItemOrderUpdate]] = []
    inventory_logs: Optional[List[Dict[str, Any]]] = []

@router.get("/health")
def sync_health_check():
    """Lightweight connectivity probe for the offline-first dashboard.
    Returns immediately so the browser knows the cloud server is reachable.
    """
    return {
        "status": "online",
        "service": "FarmBridge Sync Engine",
        "server_time": datetime.now().isoformat(),
        "ready": True
    }

@router.post("/farmer-batch")
def sync_farmer_batch(payload: SyncFarmerBatchRequest):
    """Batched two-way synchronization for farmers with intermittent network.
    Designed to complete within a sub-second burst (e.g. 2-minute 4G/Wi-Fi coverage window).
    """
    synced_products = 0
    synced_orders = 0

    # 1. Sync Products from offline device into backend datastore
    for p in payload.products:
        pid = p.get("id")
        if not pid:
            continue
        
        # Check if product exists in store or add it
        existing = store.products.get(pid)
        if existing:
            existing["title"] = p.get("name", existing.get("title"))
            existing["name"] = p.get("name", existing.get("name"))
            existing["price"] = float(p.get("price", existing.get("price", 30)))
            existing["stock"] = float(p.get("quantity", existing.get("stock", 0)))
            existing["status"] = "active" if p.get("isAvailable", True) else "inactive"
            existing["updated_at"] = datetime.now()
            synced_products += 1
        else:
            # Register new product
            store.products[pid] = {
                "id": pid,
                "farmer_id": payload.farmer_id,
                "farm_id": "farm-001",
                "farm_name": payload.farm_name,
                "title": p.get("name", "Field Crop"),
                "name": p.get("name", "Field Crop"),
                "category_id": p.get("category", "Vegetables"),
                "price": float(p.get("price", 30)),
                "unit": p.get("unit", "kg"),
                "stock": float(p.get("quantity", 10)),
                "status": "active" if p.get("isAvailable", True) else "inactive",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            synced_products += 1

    # 2. Sync Order status changes (accepted, packed, completed, rejected)
    for o_update in payload.order_updates:
        oid = o_update.id
        if oid in store.orders:
            order = store.orders[oid]
            order["status"] = o_update.status
            order["updated_at"] = datetime.now()
            if o_update.notes:
                order["notes"] = (order.get("notes") or "") + f" | [Synced] {o_update.notes}"
            synced_orders += 1
        else:
            # Order was created on device in offline demo mode, register in store
            store.orders[oid] = {
                "id": oid,
                "farmer_id": payload.farmer_id,
                "status": o_update.status,
                "notes": o_update.notes,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            synced_orders += 1

    # 3. Pull new remote orders created online while farmer was offline
    new_remote_orders = []
    farmer_ids = {payload.farmer_id, "f1000000-0000-0000-0000-000000000001"}
    
    last_sync_dt = None
    if payload.last_synced_at:
        try:
            last_sync_dt = datetime.fromisoformat(payload.last_synced_at.replace("Z", "+00:00")).replace(tzinfo=None)
        except Exception:
            last_sync_dt = None

    for ord_id, ord_data in store.orders.items():
        # Check if order belongs to farmer
        if ord_data.get("farmer_id") in farmer_ids:
            # If newer than last sync or not yet acknowledged
            created = ord_data.get("created_at")
            if isinstance(created, str):
                try:
                    created = datetime.fromisoformat(created)
                except Exception:
                    created = datetime.now()

            if last_sync_dt is None or (created and created > last_sync_dt):
                # Format into customer order model for offline client
                items_summary = []
                for item in ord_data.get("items", []):
                    items_summary.append({
                        "productId": item.get("product_id", "prod_crop"),
                        "productName": item.get("product_title", item.get("title", "Fresh Harvest")),
                        "quantity": float(item.get("quantity", 1)),
                        "unit": item.get("unit", "kg"),
                        "unitPrice": float(item.get("unit_price", 30)),
                        "subtotal": float(item.get("subtotal", 30))
                    })
                
                new_remote_orders.append({
                    "id": ord_id,
                    "customerName": ord_data.get("consumer_name", "Kavitha Sundaram (Direct Consumer)"),
                    "customerPhone": ord_data.get("consumer_phone", "+91 97890 41235"),
                    "customerAddress": ord_data.get("delivery_address", "Mahalingapuram, Pollachi"),
                    "items": items_summary if items_summary else [
                        {"productId": "prod_tomato_01", "productName": "Country Tomatoes", "quantity": 3, "unit": "kg", "unitPrice": 30, "subtotal": 90}
                    ],
                    "totalAmount": float(ord_data.get("total_amount", ord_data.get("subtotal", 90))),
                    "status": ord_data.get("status", "pending"),
                    "isDemo": False,
                    "notes": ord_data.get("special_instructions", "Direct consumer marketplace order"),
                    "createdAt": created.isoformat() if created else datetime.now().isoformat(),
                    "syncStatus": "synced"
                })

    return {
        "success": True,
        "server_time": datetime.now().isoformat(),
        "products_synced": synced_products,
        "orders_synced": synced_orders,
        "new_remote_orders": new_remote_orders,
        "message": f"Sync successful: {synced_products} products updated, {synced_orders} orders updated, {len(new_remote_orders)} incoming orders fetched."
    }
