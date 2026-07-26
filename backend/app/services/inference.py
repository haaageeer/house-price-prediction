import logging
import pathlib
import joblib
import pandas as pd

logger = logging.getLogger(__name__)

_model = None  # loaded once at startup


def load_model(model_path: str) -> None:
    """Load the trained sklearn Pipeline from disk. Called once at startup."""
    global _model
    path = pathlib.Path(model_path)
    if not path.exists():
        raise FileNotFoundError(
            f"Model file not found at '{path.resolve()}'. "
            "Run the notebook to train and export the model first."
        )
    _model = joblib.load(path)
    logger.info("Model loaded from %s", path.resolve())


def predict(df: pd.DataFrame) -> float:
    """Run inference on a single-row DataFrame and return the predicted price."""
    if _model is None:
        raise RuntimeError("Model has not been loaded. Call load_model() first.")
    result = _model.predict(df)
    return float(result[0])
