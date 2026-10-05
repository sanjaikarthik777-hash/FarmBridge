from fastapi import APIRouter, HTTPException, Query, Header
from typing import List, Optional
import uuid
from datetime import datetime, date
from app.services.demo_seed import store, calculate_distance
from app.schemas.schemas import ProductResponse, ProductCreate, ProductUpdate, CategoryResponse
from app.api.auth import get_current_user_id

router = APIRouter(tags=["Products & Categories"])

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories():
    return list(store.categories.values())

@router.get("/products", response_model=List[ProductResponse])
def list_products(
    category_id: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    farmer_id: Optional[str] = Query(None),
    farm_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None)
):
    results = list(store.products.values())

    if farmer_id:
        results = [p for p in results if p["farmer_id"] == farmer_id]
    elif farm_id:
        results = [p for p in results if p.get("farm_id") == farm_id]
    elif status:
        results = [p for p in results if p["status"] == status]
    else:
        results = [p for p in results if p["status"] == "active"]

    if category_id:
        results = [p for p in results if p.get("category_id") == category_id]

    if q:
        query = q.lower()
        results = [
            p for p in results
            if query in p["name"].lower()
            or (p.get("name_ta") and query in p["name_ta"].lower())
            or query in p.get("description", "").lower()
            or query in p.get("farm_name", "").lower()
        ]

    # Calculate distance if consumer coordinates are supplied
    out = []
    for p in results:
        p_copy = dict(p)
        if lat is not None and lng is not None:
            p_lat = p.get("latitude")
            p_lon = p.get("longitude")
            if p_lat is None or p_lon is None:
                farm = store.farms.get(p["farm_id"])
                p_lat = farm.get("latitude", 10.59) if farm else 10.59
                p_lon = farm.get("longitude", 76.97) if farm else 76.97
            p_copy["distance_km"] = calculate_distance(lat, lng, p_lat, p_lon)
        out.append(p_copy)

    if lat is not None and lng is not None:
        out.sort(key=lambda x: x.get("distance_km", 9999))

    return out

@router.get("/products/nearby", response_model=List[ProductResponse])
def get_nearby_products(
    lat: float = Query(..., description="Consumer GPS latitude"),
    lng: float = Query(..., description="Consumer GPS longitude"),
    radius_km: Optional[float] = Query(None, description="Max radius in km (1, 5, 10, 25, 50, or None for all)"),
    category_id: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    max_price: Optional[float] = Query(None),
    fulfilment: Optional[str] = Query(None)
):
    """
    Returns active produce sorted by genuine geographic distance from the consumer,
    with radius and attribute filtering.
    """
    return store.get_nearby_products(
        user_lat=lat,
        user_lon=lng,
        radius_km=radius_km,
        category_id=category_id,
        q=q,
        max_price=max_price,
        fulfilment=fulfilment
    )

@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: str,
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None)
):
    if product_id not in store.products:
        raise HTTPException(status_code=404, detail="Product listing not found")
    p = dict(store.products[product_id])
    if lat is not None and lng is not None:
        p_lat = p.get("latitude") or 10.59
        p_lon = p.get("longitude") or 76.97
        p["distance_km"] = calculate_distance(lat, lng, p_lat, p_lon)
    return p

@router.post("/products", response_model=ProductResponse)
def create_product(
    data: ProductCreate,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    uid = get_current_user_id(authorization, x_user_id)
    profile = store.profiles.get(uid)
    if not profile or profile.get("role") != "farmer":
        raise HTTPException(status_code=403, detail="Only registered farmers can list produce")

    # Find farmer's farm
    farmer_farm = next((f for f in store.farms.values() if f["owner_id"] == uid), None)
    if not farmer_farm:
        farm_id = str(uuid.uuid4())
        farmer_farm = {
            "id": farm_id,
            "owner_id": uid,
            "owner_name": profile["display_name"],
            "farm_name": f"{profile['display_name']}'s Farm",
            "description": "Family-run local agricultural farm.",
            "region": "Pollachi",
            "village": "Pollachi Rural",
            "district": "Coimbatore",
            "state": "Tamil Nadu",
            "pincode": "642001",
            "latitude": profile.get("default_latitude", 10.5982),
            "longitude": profile.get("default_longitude", 76.9721),
            "pickup_instructions": "Gate 1, farm main packing shelter.",
            "is_active": True,
            "created_at": datetime.now()
        }
        store.farms[farm_id] = farmer_farm

    pid = f"p-{uuid.uuid4().hex[:8]}"
    default_img = (
        data.image_paths
        if data.image_paths and len(data.image_paths) > 0
        else ["https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop"]
    )

    # Automatically associate product with farm's saved GPS coordinates
    prod_lat = data.latitude if data.latitude is not None else farmer_farm.get("latitude", 10.5982)
    prod_lon = data.longitude if data.longitude is not None else farmer_farm.get("longitude", 76.9721)

    new_product = {
        "id": pid,
        "farmer_id": uid,
        "farm_id": farmer_farm["id"],
        "farm_name": farmer_farm["farm_name"],
        "farmer_name": profile["display_name"],
        "category_id": data.category_id or "c1",
        "name": data.name,
        "name_ta": data.name_ta,
        "description": data.description or "Harvested directly from our farm with zero harmful chemicals.",
        "image_paths": default_img,
        "price": data.price,
        "unit": data.unit,
        "available_quantity": data.available_quantity,
        "minimum_order_quantity": data.minimum_order_quantity,
        "maximum_order_quantity": data.maximum_order_quantity or 50.0,
        "availability_date": data.availability_date or date.today(),
        "harvest_date": data.harvest_date or date.today(),
        "latitude": prod_lat,
        "longitude": prod_lon,
        "fulfilment_options": data.fulfilment_options,
        "status": "active",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    store.products[pid] = new_product
    return new_product

@router.patch("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    data: ProductUpdate,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    if product_id not in store.products:
        raise HTTPException(status_code=404, detail="Product not found")
    product = store.products[product_id]
    uid = get_current_user_id(authorization, x_user_id)
    if product["farmer_id"] != uid:
        user = store.profiles.get(uid)
        if not user or user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to modify this listing")

    if data.name is not None:
        product["name"] = data.name
    if data.name_ta is not None:
        product["name_ta"] = data.name_ta
    if data.description is not None:
        product["description"] = data.description
    if data.price is not None:
        product["price"] = data.price
    if data.available_quantity is not None:
        product["available_quantity"] = data.available_quantity
    if data.unit is not None:
        product["unit"] = data.unit
    if data.status is not None:
        product["status"] = data.status
    if data.fulfilment_options is not None:
        product["fulfilment_options"] = data.fulfilment_options
    if data.image_paths is not None:
        product["image_paths"] = data.image_paths

    product["updated_at"] = datetime.now()
    return product

@router.delete("/products/{product_id}")
def delete_product(
    product_id: str,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    if product_id not in store.products:
        raise HTTPException(status_code=404, detail="Product not found")
    product = store.products[product_id]
    uid = get_current_user_id(authorization, x_user_id)
    if product["farmer_id"] != uid:
        user = store.profiles.get(uid)
        if not user or user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to delete this listing")

    del store.products[product_id]
    return {"success": True, "message": "Product listing deleted"}

@router.post("/products/{product_id}/pause", response_model=ProductResponse)
def pause_product(
    product_id: str,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    if product_id not in store.products:
        raise HTTPException(status_code=404, detail="Product not found")
    product = store.products[product_id]
    product["status"] = "paused" if product["status"] == "active" else "active"
    product["updated_at"] = datetime.now()
    return product

@router.post("/products/{product_id}/mark-sold-out", response_model=ProductResponse)
def mark_product_sold_out(product_id: str):
    if product_id not in store.products:
        raise HTTPException(status_code=404, detail="Product not found")
    product = store.products[product_id]
    product["available_quantity"] = 0.0
    product["status"] = "sold_out"
    product["updated_at"] = datetime.now()
    return product
