import pandas as pd
from app.schemas.prediction import PredictionRequest

# Columns used during training (must match notebook exactly)
NUMERIC_FEATURES = [
    "area_sqft",
    "current_floor",
    "total_floors",
    "bathroom_num",
    "balcony_num",
    "car_parking_num",
    "view_main_road",
    "view_garden_park",
    "view_pool",
]
CATEGORICAL_FEATURES = [
    "location_grouped",
    "Furnishing",
    "Transaction",
    "Ownership",
    "facing",
]
ALL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def build_dataframe(req: PredictionRequest, known_locations: list[str]) -> pd.DataFrame:
    """
    Convert a PredictionRequest into a single-row DataFrame
    with exactly the column names used during training.

    Unknown locations are mapped to 'other' so the OHE pipeline
    can handle them gracefully via handle_unknown='ignore'.
    """
    location_grouped = (
        req.location.lower().strip()
        if req.location.lower().strip() in known_locations
        else "other"
    )

    row = {
        # Numeric
        "area_sqft": req.area_sqft,
        "current_floor": req.current_floor,
        "total_floors": req.total_floors,
        "bathroom_num": req.bathroom_num,
        "balcony_num": req.balcony_num,
        "car_parking_num": req.car_parking_num,
        "view_main_road": req.view_main_road,
        "view_garden_park": req.view_garden_park,
        "view_pool": req.view_pool,
        # Categorical
        "location_grouped": location_grouped,
        "Furnishing": req.furnishing,
        "Transaction": req.transaction,
        "Ownership": req.ownership,
        "facing": req.facing,
    }

    return pd.DataFrame([row], columns=ALL_FEATURES)
