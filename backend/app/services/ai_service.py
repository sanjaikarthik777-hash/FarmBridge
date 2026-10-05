from typing import Dict, List, Any
from app.services.demo_seed import store

class AIService:
    @staticmethod
    def get_price_estimate(crop_name: str, quantity: float, unit: str, farmer_price: float) -> Dict[str, Any]:
        """
        AI Price Recommendation & Decision Support.
        Provides a transparent benchmark comparison against Tamil Nadu Regulated Markets
        and Uzhavar Sandhai observations. Does not mandate or constrain the farmer's price.
        """
        # Find matching reference
        matched_ref = None
        for ref in store.price_references:
            if any(term.lower() in ref["crop_name"].lower() for term in crop_name.lower().split()):
                matched_ref = ref
                break

        if not matched_ref:
            # Fallback baseline
            modal_price = farmer_price
            min_price = round(farmer_price * 0.85, 2)
            max_price = round(farmer_price * 1.15, 2)
            source_name = "Regional General Agricultural Average"
        else:
            modal_price = matched_ref["modal_price"]
            min_price = matched_ref["min_price"]
            max_price = matched_ref["max_price"]
            source_name = matched_ref["source_name"]

        # Classification
        if farmer_price < min_price:
            price_band = "below_market"
            note = f"Your price (₹{farmer_price}/{unit}) is lower than the local Uzhavar Sandhai minimum (₹{min_price}/{unit}). Great for fast sales, but ensure your production costs are covered."
        elif farmer_price <= max_price:
            price_band = "competitive"
            note = f"Your price (₹{farmer_price}/{unit}) is within the healthy local market range (₹{min_price} - ₹{max_price}/{unit}). This provides high buyer appeal with fair farmer returns."
        else:
            price_band = "premium"
            note = f"Your price (₹{farmer_price}/{unit}) is above the local benchmark (Modal: ₹{modal_price}/{unit}). Buyers value organic quality, but ensure harvest freshness is highlighted in your listing."

        # Net farmer earnings calculation (transparent ₹5 platform fee per order or flat 0%)
        gross_sales = farmer_price * quantity
        disclosed_fee = 5.00 # Nominal flat fee for platform sustainability
        net_earnings = max(0.0, gross_sales - disclosed_fee)

        return {
            "crop_name": crop_name,
            "unit": unit,
            "proposed_price": farmer_price,
            "reference_modal": modal_price,
            "reference_min": min_price,
            "reference_max": max_price,
            "price_band": price_band,
            "estimated_farmer_earnings": round(net_earnings, 2),
            "disclosed_platform_fee": disclosed_fee,
            "source_name": source_name,
            "note": note
        }

    @staticmethod
    def get_demand_insights() -> List[Dict[str, Any]]:
        """
        AI Demand Trends from aggregated platform inquiries, cart additions, and local demand.
        Clearly labeled as marketplace intelligence.
        """
        return [
            {
                "crop_name": "Country Tomatoes (நாட்டு தக்காளி)",
                "crop_name_ta": "நாட்டு தக்காளி",
                "category": "Fresh Vegetables",
                "demand_level": "High",
                "weekly_searches": 340,
                "order_volume": 128,
                "trend": "+24% demand this week",
                "buyer_interest_note": "High household demand in Pollachi town; buyers actively looking for morning-harvested produce."
            },
            {
                "crop_name": "Pollachi Sweet Tender Coconut (இளநீர்)",
                "crop_name_ta": "பொள்ளாச்சி இளநீர்",
                "category": "Coconut & Plantation",
                "demand_level": "High",
                "weekly_searches": 510,
                "order_volume": 215,
                "trend": "+32% surge",
                "buyer_interest_note": "Peak seasonal demand from residential apartments & retail fruit stalls along Aliyar-Pollachi route."
            },
            {
                "crop_name": "Small Red Shallots (சின்ன வெங்காயம்)",
                "crop_name_ta": "சாம்பார் சின்ன வெங்காயம்",
                "category": "Fresh Vegetables",
                "demand_level": "Moderate",
                "weekly_searches": 190,
                "order_volume": 64,
                "trend": "Stable (+4%)",
                "buyer_interest_note": "Consistent restaurant and home kitchen procurement; preference for medium-grade dry cured stock."
            },
            {
                "crop_name": "Anaimalai Red Bananas (செவ்வாழை)",
                "crop_name_ta": "ஆனைமலை செவ்வாழை",
                "category": "Fresh Fruits",
                "demand_level": "Rising",
                "weekly_searches": 215,
                "order_volume": 72,
                "trend": "+15% this week",
                "buyer_interest_note": "Growing interest for naturally ripened native bananas for weekend family delivery."
            },
            {
                "crop_name": "Wood-Pressed Virgin Coconut Oil (மரச்செக்கு)",
                "crop_name_ta": "மரச்செக்கு தேங்காய் எண்ணெய்",
                "category": "Cold-Pressed Oils & Spices",
                "demand_level": "Rising",
                "weekly_searches": 140,
                "order_volume": 38,
                "trend": "+19% repeat orders",
                "buyer_interest_note": "Strong repeat orders from health-conscious households seeking authentic wood-pressed purity."
            }
        ]

    @staticmethod
    def get_route_grouping() -> Dict[str, Any]:
        """
        Smart Delivery Cluster Grouping for Local Logistics Optimization.
        Groups open orders by area & time slot to minimize carbon footprint and transit time.
        """
        return {
            "cluster_area": "Pollachi Central & Mahalingapuram",
            "active_orders_count": 2,
            "optimized_stops": [
                {"stop": 1, "type": "pickup", "location": "Thennam Thoppu Natural Farm, Aliyar Rd", "farmer": "Murugan Palanisamy"},
                {"stop": 2, "type": "dropoff", "location": "Door 14, 2nd Cross, Mahalingapuram", "buyer": "Kavitha Sundaram", "order_id": "FB-2026-001"},
                {"stop": 3, "type": "dropoff", "location": "Flat 3B, Sri Krishna Apts, Venkatesa Colony", "buyer": "Kavitha Sundaram", "order_id": "FB-2026-002"}
            ],
            "total_distance_km": 8.4,
            "estimated_fuel_saving_pct": 28.5,
            "transit_slot": "Morning 8:00 AM - 10:30 AM"
        }
