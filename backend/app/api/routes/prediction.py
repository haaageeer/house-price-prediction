import json
import logging
import pathlib

from fastapi import APIRouter, HTTPException, Request

from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    format_price,
)
from app.services import preprocessing, inference

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/health", summary="Health check")
async def health():
    """Returns 200 OK when the API is running and the model is loaded."""
    return {"status": "ok", "model_loaded": inference._model is not None}


@router.get("/locations", summary="List valid locations")
async def list_locations(request: Request):
    """Returns the list of locations the model was trained on."""
    return {"locations": request.app.state.locations}


@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Predict house price",
)
async def predict_price(body: PredictionRequest, request: Request):
    """
    Accept property details and return a predicted price in Indian Rupees.

    - Unknown locations are automatically mapped to 'other'.
    - The sklearn Pipeline handles all preprocessing internally.
    """
    try:
        df = preprocessing.build_dataframe(body, request.app.state.locations)
        price = inference.predict(df)

        if price <= 0:
            raise ValueError(f"Model returned non-positive price: {price}")

        return PredictionResponse(
            predicted_price=round(price, 2),
            price_display=format_price(price),
            location=body.location,
            area_sqft=body.area_sqft,
        )
    except ValueError as exc:
        logger.error("Prediction error: %s", exc)
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("Unexpected error during prediction")
        raise HTTPException(status_code=500, detail="Internal server error")
