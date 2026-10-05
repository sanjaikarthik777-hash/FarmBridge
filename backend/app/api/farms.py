from fastapi import APIRouter, HTTPException, Header, Query
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from app.services.demo_seed import store, calculate_distance
from app.schemas.schemas import FarmResponse, FarmCreate, FarmLocationUpdate
from app.api.auth import get_current_user_id

router = APIRouter(prefix="/farms", tags=["Farms & Geolocation"])

@router.get("", response_model=List[FarmResponse])
def list_farms(
    lat: Optional[float] = Query(None, description="Consumer latitude"),
    lng: Optional[float] = Query(None, description="Consumer longitude")
):
    farms = []
    for farm in store.farms.values():
        if not farm.get("is_active", True):
            continue
        f_copy = dict(farm)
        if lat is not None and lng is not None:
            f_lat = farm.get("latitude", 10.59)
            f_lon = farm.get("longitude", 76.97)
            f_copy["distance_km"] = calculate_distance(lat, lng, f_lat, f_lon)
        p_count = sum(1 for p in store.products.values() if p["farm_id"] == farm["id"] and p["status"] == "active")
        f_copy["products_count"] = p_count
        farms.append(f_copy)

    if lat is not None and lng is not None:
        farms.sort(key=lambda x: x.get("distance_km", 9999))

    return farms

@router.get("/nearby", response_model=List[FarmResponse])
def get_nearby_farms(
    lat: float = Query(..., description="Consumer GPS latitude"),
    lng: float = Query(..., description="Consumer GPS longitude"),
    radius_km: Optional[float] = Query(None, description="Radius filter in kilometers (e.g. 1, 5, 10, 25, 50, or None for all)")
):
    """
    Core Geospatial Farm Discovery:
    Calculates genuine Haversine distance from the consumer's coordinates to all registered farms,
    filtering by the chosen radius (1 km, 5 km, 10 km, 25 km, 50 km, or all), sorted nearest first.
    """
    return store.get_nearby_farms(user_lat=lat, user_lon=lng, radius_km=radius_km)

@router.get("/my-farm", response_model=FarmResponse)
def get_my_farm(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    uid = get_current_user_id(authorization, x_user_id)
    farm = next((f for f in store.farms.values() if f.get("owner_id") == uid), None)
    if not farm:
        # Create a default one if farmer
        profile = store.profiles.get(uid)
        farm_id = str(uuid.uuid4())
        farm = {
            "id": farm_id,
            "owner_id": uid,
            "owner_name": profile.get("display_name", "Farmer") if profile else "Farmer",
            "farm_name": f"{profile.get('display_name', 'My').split()[0]}'s Farm",
            "description": "Natural produce grove in Pollachi.",
            "region": "Pollachi",
            "village": "Pollachi Rural",
            "district": "Coimbatore",
            "state": "Tamil Nadu",
            "pincode": "642001",
            "farm_address": "Farm Gate, Pollachi",
            "latitude": 10.5982,
            "longitude": 76.9721,
            "gps_accuracy": 10.0,
            "is_approximate": False,
            "pickup_instructions": "Gate 1, farm main packing shelter.",
            "is_active": True,
            "created_at": datetime.now()
        }
        store.farms[farm_id] = farm
    return farm

@router.get("/{farm_id}", response_model=FarmResponse)
def get_farm(
    farm_id: str,
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    if farm_id not in store.farms:
        raise HTTPException(status_code=404, detail="Farm not found")
    farm = dict(store.farms[farm_id])
    uid = get_current_user_id(authorization, x_user_id)
    if farm.get("owner_id") != uid:
        farm["pickup_instructions"] = "Disclosed upon confirmed order fulfilment."

    if lat is not None and lng is not None:
        farm["distance_km"] = calculate_distance(lat, lng, farm.get("latitude", 10.59), farm.get("longitude", 76.97))

    farm["products_count"] = sum(1 for p in store.products.values() if p["farm_id"] == farm["id"] and p["status"] == "active")
    return farm

@router.patch("/{farm_id}/location", response_model=FarmResponse)
def update_farm_location(
    farm_id: str,
    data: FarmLocationUpdate,
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
):
    if farm_id not in store.farms:
        raise HTTPException(status_code=404, detail="Farm not found")
    farm = store.farms[farm_id]
    uid = get_current_user_id(authorization, x_user_id)
    if farm["owner_id"] != uid:
        user = store.profiles.get(uid)
        if not user or user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to edit this farm's location")

    farm["latitude"] = data.latitude
    farm["longitude"] = data.longitude
    if data.gps_accuracy is not None:
        farm["gps_accuracy"] = data.gps_accuracy
    farm["is_approximate"] = data.is_approximate
    if data.farm_address:
        farm["farm_address"] = data.farm_address
    if data.village:
        farm["village"] = data.village
    if data.district:
        farm["district"] = data.district
    if data.pincode:
        farm["pincode"] = data.pincode

    # Also synchronize all products under this farm
    for p in store.products.values():
        if p["farm_id"] == farm_id:
            p["latitude"] = data.latitude
            p["longitude"] = data.longitude

    return farm
