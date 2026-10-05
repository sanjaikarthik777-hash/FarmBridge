from fastapi import APIRouter, HTTPException, Header
from typing import List, Optional
from datetime import datetime
from app.services.demo_seed import store
from app.schemas.schemas import DeliveryTaskResponse
from app.api.auth import get_current_user_id

router = APIRouter(prefix="/delivery", tags=["Delivery Logistics"])

@router.get("/tasks", response_model=List[DeliveryTaskResponse])
def list_delivery_tasks(x_user_id: Optional[str] = Header(None)):
    uid = get_current_user_id(x_user_id)
    profile = store.profiles.get(uid)
    role = profile.get("role") if profile else "delivery"

    tasks = list(store.delivery_tasks.values())
    if role == "delivery":
        # Delivery partner sees assigned tasks or unassigned ones
        tasks = [t for t in tasks if t.get("delivery_partner_id") == uid or not t.get("delivery_partner_id")]

    tasks.sort(key=lambda x: x["created_at"], reverse=True)
    return tasks

@router.post("/tasks/{task_id}/accept", response_model=DeliveryTaskResponse)
def accept_task(task_id: str, x_user_id: Optional[str] = Header(None)):
    if task_id not in store.delivery_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    task = store.delivery_tasks[task_id]
    uid = get_current_user_id(x_user_id)
    profile = store.profiles.get(uid, {})
    task["delivery_partner_id"] = uid
    task["delivery_partner_name"] = profile.get("display_name", "Assigned Driver")
    task["status"] = "accepted"
    return task

@router.post("/tasks/{task_id}/status", response_model=DeliveryTaskResponse)
def update_delivery_status(task_id: str, status: str, x_user_id: Optional[str] = Header(None)):
    if task_id not in store.delivery_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    task = store.delivery_tasks[task_id]
    task["status"] = status
    if status == "delivered":
        task["delivered_time"] = datetime.now()
        # Also update parent order
        order = store.orders.get(task["order_id"])
        if order:
            order["status"] = "delivered"
    return task
