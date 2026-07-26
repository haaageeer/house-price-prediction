import json
import logging
import pathlib
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.services import inference
from app.utils.logging_config import setup_logging
from app.api.routes.prediction import router as prediction_router

settings = get_settings()
setup_logging(settings.log_level)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the model and locations list once at startup."""
    logger.info("Starting up — loading model from %s", settings.model_path)
    inference.load_model(settings.model_path)

    locations_path = pathlib.Path(settings.locations_path)
    if locations_path.exists():
        app.state.locations = json.loads(locations_path.read_text(encoding="utf-8"))
        logger.info("Loaded %d locations from %s", len(app.state.locations), locations_path)
    else:
        logger.warning("locations.json not found at %s — using empty list", locations_path)
        app.state.locations = []

    yield

    logger.info("Shutting down.")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "End-to-end Machine Learning API for predicting Indian residential property prices. "
        "Trained on ~176,000 listings from 81 cities."
    ),
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(prediction_router, prefix="", tags=["Prediction"])
