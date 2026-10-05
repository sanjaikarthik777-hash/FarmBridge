from fastapi import APIRouter, HTTPException, Header
from typing import Optional, List
import uuid
from app.services.demo_seed import store
from app.schemas.schemas import CartResponse, CartItemCreate, CartItemResponse
from app.api.auth import get_current_user_id
from app.core.config import settings

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.get("", response_model=CartResponse)
def get_cart(x_user_id: Optional[str] = Header(None)):
    uid = get_current_user_id(x_user_id)
    items = store.carts.get(uid, [])

    cart_items: List[CartItemResponse] = []
    subtotal = 0.0
    farmer_id = None
    farmer_name = None

    for item in items:
        prod = store.products.get(item["product_id"])
        if not prod:
            continue
        line_tot = round(prod["price"] * item["quantity"], 2)
        subtotal += line_tot
        farmer_id = prod["farmer_id"]
        farmer_name = prod.get("farmer_name") or prod.get("farm_name")

        cart_items.append(
            CartItemResponse(
                id=item["id"],
                product_id=prod["id"],
                product_name=prod["name"],
                unit=prod["unit"],
                unit_price=prod["price"],
                quantity=item["quantity"],
                line_total=line_tot,
                available_stock=prod["available_quantity"],
                farmer_id=prod["farmer_id"],
                farm_name=prod.get("farm_name", "Local Farm"),
                image_url=prod["image_paths"][0] if prod.get("image_paths") else None
            )
        )

    subtotal = round(subtotal, 2)
    delivery_fee = settings.BASE_DELIVERY_FEE if len(cart_items) > 0 else 0.0
    platform_fee = settings.PLATFORM_FEE_FIXED if len(cart_items) > 0 else 0.0
    total = round(subtotal + delivery_fee + platform_fee, 2)

    return CartResponse(
        items=cart_items,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        platform_fee=platform_fee,
        total=total,
        farmer_id=farmer_id,
        farmer_name=farmer_name
    )

@router.post("/items", response_model=CartResponse)
def add_to_cart(data: CartItemCreate, x_user_id: Optional[str] = Header(None)):
    uid = get_current_user_id(x_user_id)
    prod = store.products.get(data.product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    if prod["status"] != "active":
        raise HTTPException(status_code=400, detail="This produce is currently paused or sold out")

    if data.quantity > prod["available_quantity"]:
        raise HTTPException(
            status_code=400,
            detail=f"Only {prod['available_quantity']} {prod['unit']} currently available from farm"
        )

    if uid not in store.carts:
        store.carts[uid] = []

    user_cart = store.carts[uid]

    # Check single-farmer cart rule for clean MVP fulfilment
    for existing in user_cart:
        existing_prod = store.products.get(existing["product_id"])
        if existing_prod and existing_prod["farmer_id"] != prod["farmer_id"]:
            # Automatically start a fresh basket for the new farmer
            user_cart.clear()
            break

    # Check if product is already in cart
    existing_item = next((i for i in user_cart if i["product_id"] == data.product_id), None)
    if existing_item:
        new_qty = existing_item["quantity"] + data.quantity
        if new_qty > prod["available_quantity"]:
            raise HTTPException(
                status_code=400,
                detail=f"Requested total {new_qty} {prod['unit']} exceeds available {prod['available_quantity']} {prod['unit']}"
            )
        existing_item["quantity"] = new_qty
    else:
        user_cart.append({
            "id": f"ci-{uuid.uuid4().hex[:8]}",
            "product_id": data.product_id,
            "quantity": data.quantity
        })

    return get_cart(x_user_id)

@router.patch("/items/{item_id}", response_model=CartResponse)
def update_cart_item(item_id: str, quantity: float, x_user_id: Optional[str] = Header(None)):
    uid = get_current_user_id(x_user_id)
    user_cart = store.carts.get(uid, [])
    item = next((i for i in user_cart if i["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    prod = store.products.get(item["product_id"])
    if not prod:
        user_cart.remove(item)
        return get_cart(x_user_id)

    if quantity <= 0:
        user_cart.remove(item)
    elif quantity > prod["available_quantity"]:
        raise HTTPException(
            status_code=400,
            detail=f"Only {prod['available_quantity']} {prod['unit']} available"
        )
    else:
        item["quantity"] = quantity

    return get_cart(x_user_id)

@router.delete("/items/{item_id}", response_model=CartResponse)
def remove_cart_item(item_id: str, x_user_id: Optional[str] = Header(None)):
    uid = get_current_user_id(x_user_id)
    user_cart = store.carts.get(uid, [])
    store.carts[uid] = [i for i in user_cart if i["id"] != item_id]
    return get_cart(x_user_id)

@router.delete("", response_model=CartResponse)
def clear_cart(x_user_id: Optional[str] = Header(None)):
    uid = get_current_user_id(x_user_id)
    store.carts[uid] = []
    return get_cart(x_user_id)
