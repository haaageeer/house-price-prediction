import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import pandas as pd

from app.main import app

# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def client():
    """
    Test client with the model mocked so tests run without needing house_price.pkl.
    """
    mock_model = MagicMock()
    mock_model.predict.return_value = [8_500_000.0]  # ₹ 85 Lac

    with patch("app.services.inference._model", mock_model):
        app.state.locations = ["bangalore", "mumbai", "gurgaon", "other"]
        with TestClient(app, raise_server_exceptions=True) as c:
            yield c


# ── Tests ─────────────────────────────────────────────────────────────────────

def test_health(client):
    """GET /health should return 200 and status ok."""
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"


def test_predict_happy_path(client):
    """POST /predict with valid data should return 200 and a positive price."""
    payload = {
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
    resp = client.post("/predict", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["predicted_price"] > 0
    assert "₹" in data["price_display"]
    assert data["location"] == "bangalore"


def test_predict_invalid_area_returns_422(client):
    """POST /predict with area_sqft <= 0 should return 422 Unprocessable Entity."""
    payload = {
        "location": "bangalore",
        "area_sqft": -50,   # invalid
        "current_floor": 3,
        "total_floors": 10,
        "bathroom_num": 2,
        "balcony_num": 1,
        "car_parking_num": 1,
        "view_main_road": 0,
        "view_garden_park": 0,
        "view_pool": 0,
        "furnishing": "Semi-Furnished",
        "transaction": "Resale",
        "ownership": "Freehold",
        "facing": "East",
    }
    resp = client.post("/predict", json=payload)
    assert resp.status_code == 422


def test_predict_unknown_location_maps_to_other(client):
    """Unknown locations should silently map to 'other' and still return 200."""
    payload = {
        "location": "atlantis",   # not in training data
        "area_sqft": 900,
        "current_floor": 1,
        "total_floors": 5,
        "bathroom_num": 1,
        "balcony_num": 0,
        "car_parking_num": 0,
        "view_main_road": 0,
        "view_garden_park": 0,
        "view_pool": 0,
        "furnishing": "Unfurnished",
        "transaction": "New Property",
        "ownership": "Freehold",
        "facing": "Unknown",
    }
    resp = client.post("/predict", json=payload)
    assert resp.status_code == 200
