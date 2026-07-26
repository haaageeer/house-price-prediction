import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PredictionForm from "../components/PredictionForm";
import type { PredictionResult } from "../types/prediction";

export default function HomePage() {
  const navigate = useNavigate();

  function handleResult(result: PredictionResult) {
    // Navigate to /result and pass result as router location state
    navigate("/result", { state: { result } });
  }

  return (
    <main className="page home-page">
      <div className="page-header">
        <div className="page-badge">🏡 AI-Powered</div>
        <h1 className="page-title">House Price Predictor</h1>
        <p className="page-subtitle">
          Enter your property details below and get an instant AI-based price estimate.
        </p>
      </div>

      <div className="form-card">
        <PredictionForm onResult={handleResult} />
      </div>
    </main>
  );
}
