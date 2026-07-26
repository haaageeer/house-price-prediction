from pydantic import BaseModel, Field
from typing import Literal


class PredictionRequest(BaseModel):
    location: str = Field(..., description="City/area name (e.g. 'mumbai', 'bangalore')")
    area_sqft: float = Field(..., gt=0, description="Carpet/super area in sqft")
    current_floor: int = Field(0, ge=-2, description="Floor number (0=Ground, -1=Upper Basement, -2=Lower Basement)")
    total_floors: int = Field(1, ge=1, description="Total floors in building")
    bathroom_num: float = Field(1.0, ge=0, description="Number of bathrooms")
    balcony_num: float = Field(0.0, ge=0, description="Number of balconies")
    car_parking_num: int = Field(0, ge=0, description="Number of car parking spots")
    view_main_road: int = Field(0, ge=0, le=1, description="Overlooking main road (0/1)")
    view_garden_park: int = Field(0, ge=0, le=1, description="Overlooking garden/park (0/1)")
    view_pool: int = Field(0, ge=0, le=1, description="Overlooking pool (0/1)")
    furnishing: str = Field("Semi-Furnished", description="Furnishing status")
    transaction: str = Field("Resale", description="'New Property' or 'Resale'")
    ownership: str = Field("Freehold", description="Ownership type")
    facing: str = Field("Unknown", description="Compass facing direction")

    model_config = {
        "json_schema_extra": {
            "example": {
                "location": "bangalore",
                "area_sqft": 1200,
                "current_floor": 3,
                "total_floors": 10,
                "bathroom_num": 2,
                "balcony_num": 1,
                "car_parking_num": 1,
                "view_main_road": 0,
                "view_garden_park": 1,
                "view_pool": 0,
                "furnishing": "Semi-Furnished",
                "transaction": "Resale",
                "ownership": "Freehold",
                "facing": "East",
            }
        }
    }


class PredictionResponse(BaseModel):
    predicted_price: float = Field(..., description="Predicted price in Indian Rupees")
    price_display: str = Field(..., description="Human-readable formatted price (e.g. '₹ 85.4 Lac')")
    location: str
    area_sqft: float


def format_price(price: float) -> str:
    """Format rupees into human-readable Lac / Cr notation."""
    if price >= 1e7:
        return f"₹ {price / 1e7:.2f} Cr"
    else:
        return f"₹ {price / 1e5:.2f} Lac"
