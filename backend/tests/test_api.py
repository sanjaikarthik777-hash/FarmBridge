import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.services.demo_seed import store

client = TestClient(app)

def setup_function():
    store.reset()

def test_health_and_root():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_mobile_otp_flow():
    # 1. Send OTP to a farmer mobile
    res = client.post("/api/v1/auth/send-otp", json={
        "mobile": "+91 94432 10842",
        "role": "farmer",
        "purpose": "login"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "dev_otp" in data
    dev_code = data["dev_otp"]

    # 2. Verify OTP and get session token
    res_verify = client.post("/api/v1/auth/verify-otp", json={
        "mobile": "+91 94432 10842",
        "otp": dev_code,
        "role": "farmer"
    })
    assert res_verify.status_code == 200
    v_data = res_verify.json()
    assert "token" in v_data
    assert v_data["profile"]["role"] == "farmer"
    assert v_data["farm"] is not None

def test_farmer_registration_with_gps():
    # Register a new farmer with GPS coordinates
    reg_payload = {
        "display_name": "Rangaraj Kounder",
        "mobile": "+91 98422 99887",
        "otp": "123456",
        "farm_name": "Valparai Foothills Spice Grove",
        "description": "Cardamom, pepper, and mountain plantains.",
        "farm_address": "Kottur Road, Pollachi",
        "village": "Kottur",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "pincode": "642103",
        "latitude": 10.5340,
        "longitude": 76.9810,
        "gps_accuracy": 14.2,
        "is_approximate": False,
        "preferred_language": "ta"
    }
    res = client.post("/api/v1/auth/farmer/register", json=reg_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["profile"]["display_name"] == "Rangaraj Kounder"
    assert data["farm"]["farm_name"] == "Valparai Foothills Spice Grove"
    assert data["farm"]["latitude"] == 10.5340

def test_nearby_farms_geospatial_radius():
    # Consumer at Pollachi Central: Lat: 10.6580, Lng: 77.0080
    # Thennam Thoppu Natural Farm: Lat: 10.5982, Lng: 76.9721 (~7.7 km away)
    # Anaimalai Organic Valley: Lat: 10.5810, Lng: 76.9320 (~12.0 km away)
    
    # 1. Radius = 5 km -> should find 0 farms
    res_5k = client.get("/api/v1/farms/nearby?lat=10.6580&lng=77.0080&radius_km=5")
    assert res_5k.status_code == 200
    assert len(res_5k.json()) == 0

    # 2. Radius = 10 km -> should find Thennam Thoppu (~7.7 km)
    res_10k = client.get("/api/v1/farms/nearby?lat=10.6580&lng=77.0080&radius_km=10")
    assert res_10k.status_code == 200
    farms_10k = res_10k.json()
    assert len(farms_10k) >= 1
    assert farms_10k[0]["distance_km"] < 10.0

    # 3. Radius = 25 km -> should find both farms sorted nearest first
    res_25k = client.get("/api/v1/farms/nearby?lat=10.6580&lng=77.0080&radius_km=25")
    assert res_25k.status_code == 200
    farms_25k = res_25k.json()
    assert len(farms_25k) >= 2
    assert farms_25k[0]["distance_km"] <= farms_25k[1]["distance_km"]

def test_nearby_products_query():
    # Query products nearby Pollachi Central
    res = client.get("/api/v1/products/nearby?lat=10.6580&lng=77.0080&radius_km=15")
    assert res.status_code == 200
    prods = res.json()
    assert len(prods) > 0
    assert "distance_km" in prods[0]
    # Check that they are sorted by distance
    for i in range(len(prods) - 1):
        assert prods[i]["distance_km"] <= prods[i+1]["distance_km"]
