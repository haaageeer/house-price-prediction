from pydantic_settings import BaseSettings
from functools import lru_cache
import pathlib


class Settings(BaseSettings):
    app_name: str = "House Price Prediction API"
    app_version: str = "1.0.0"
    debug: bool = False
    log_level: str = "INFO"

    # Path to the trained model pickle (relative to backend/ root or absolute)
    model_path: str = str(
        pathlib.Path(__file__).resolve().parents[3] / "models" / "house_price.pkl"
    )
    # Path to the locations JSON file
    locations_path: str = str(
        pathlib.Path(__file__).resolve().parent.parent / "locations.json"
    )

    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
