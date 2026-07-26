import { useLocation, useNavigate, Link } from "react-router-dom";
import type { PredictionResult } from "../types/prediction";

function formatINR(amount: number): string {
  if (amount >= 10_000_000) {
    return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
  } else if (amount >= 100_000) {
    return `₹${(amount / 100_000).toFixed(2)} Lac`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatLocation(loc: string): string {
  return loc
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result: PredictionResult | undefined = location.state?.result;

  // If user navigated here directly with no data, redirect home
  if (!result) {
    return (
      <main className="page not-found-page">
        <div className="not-found-icon">🔍</div>
        <h1 className="not-found-title">No Prediction Found</h1>
        <p className="not-found-msg">
          Please fill in the form first to get a price estimate.
        </p>
        <Link to="/" className="back-home-btn">
          ← Go to Predictor
        </Link>
      </main>
    );
  }

  const pricePerSqft = result.predicted_price / result.area_sqft;

  const details = [
    { label: "Location", value: formatLocation(result.location), icon: "📍" },
    { label: "Carpet Area", value: `${result.area_sqft.toLocaleString()} sqft`, icon: "📐" },
    { label: "Bathrooms", value: String(result.request.bathroom_num), icon: "🚿" },
    { label: "Balconies", value: String(result.request.balcony_num), icon: "🌅" },
    { label: "Car Parking", value: String(result.request.car_parking_num), icon: "🚗" },
    { label: "Furnishing", value: result.request.furnishing, icon: "🛋️" },
    { label: "Transaction", value: result.request.transaction, icon: "🤝" },
    { label: "Ownership", value: result.request.ownership, icon: "📜" },
    { label: "Facing", value: result.request.facing, icon: "🧭" },
    {
      label: "Floor",
      value: `${result.request.current_floor} / ${result.request.total_floors}`,
      icon: "🏢",
    },
  ];

  return (
    <main className="page result-page">
      {/* Price Card */}
      <div className="result-hero">
        <div className="result-badge">🔮 Prediction Result</div>
        <h1 className="result-price">{formatINR(result.predicted_price)}</h1>
        <p className="result-location">{formatLocation(result.location)}</p>
        <div className="result-per-sqft">
          ≈ {formatINR(Math.round(pricePerSqft))} per sqft
        </div>
      </div>

      {/* Details Grid */}
      <section className="result-details-section">
        <h2 className="result-section-title">Property Details</h2>
        <div className="result-details-grid">
          {details.map((d) => (
            <div key={d.label} className="result-detail-card">
              <span className="detail-icon">{d.icon}</span>
              <span className="detail-label">{d.label}</span>
              <span className="detail-value">{d.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Views / Overlooking */}
      {(result.request.view_main_road ||
        result.request.view_garden_park ||
        result.request.view_pool) ? (
        <section className="result-views">
          <h2 className="result-section-title">Views</h2>
          <div className="views-tags">
            {result.request.view_main_road ? <span className="view-tag">🛣️ Main Road</span> : null}
            {result.request.view_garden_park ? <span className="view-tag">🌿 Garden / Park</span> : null}
            {result.request.view_pool ? <span className="view-tag">🏊 Pool</span> : null}
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <div className="result-actions">
        <button
          id="predict-again-btn"
          className="predict-btn"
          onClick={() => navigate("/")}
        >
          🔁 Predict Another Property
        </button>
      </div>
    </main>
  );
}
