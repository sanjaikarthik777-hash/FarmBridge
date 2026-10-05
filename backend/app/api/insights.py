from fastapi import APIRouter
from typing import List, Dict, Any
from app.services.demo_seed import store
from app.services.ai_service import AIService
from app.schemas.schemas import (
    PriceReferenceResponse, PriceEstimateRequest, PriceEstimateResponse, DemandInsightItem
)

router = APIRouter(prefix="/insights", tags=["AI & Decision Support"])

@router.get("/price-reference", response_model=List[PriceReferenceResponse])
def get_price_references():
    """Returns official mandi and Uzhavar Sandhai benchmark price references."""
    return store.price_references

@router.post("/price-estimate", response_model=PriceEstimateResponse)
def get_price_estimate(data: PriceEstimateRequest):
    """
    AI Decision Support: Computes reference modal band and net farmer earnings.
    Clearly marks price setting as completely in the farmer's hands.
    """
    return AIService.get_price_estimate(
        crop_name=data.crop_name,
        quantity=data.quantity,
        unit=data.unit,
        farmer_price=data.farmer_price
    )

@router.get("/demand", response_model=List[DemandInsightItem])
def get_demand_insights():
    """Returns crop demand insights from aggregated platform activity."""
    return AIService.get_demand_insights()

@router.get("/route-grouping")
def get_delivery_route_grouping() -> Dict[str, Any]:
    """Smart delivery route clustering for optimal local dispatch."""
    return AIService.get_route_grouping()
