# syntax=docker/dockerfile:1
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Copy model and locations (built outside Docker, mounted or copied at build time)
COPY ../models/house_price.pkl ./models/house_price.pkl
COPY app/locations.json ./app/locations.json

ENV MODEL_PATH=/app/models/house_price.pkl
ENV LOCATIONS_PATH=/app/app/locations.json

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
