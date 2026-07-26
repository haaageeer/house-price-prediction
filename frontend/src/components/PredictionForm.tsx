import { useState, useEffect, FormEvent } from "react";
import { fetchLocations, predictPrice } from "../api/predictionClient";
import type { PredictionRequest, PredictionResult } from "../types/prediction";

const FURNISHING_OPTIONS = ["Furnished", "Semi-Furnished", "Unfurnished", "Unknown"];
const TRANSACTION_OPTIONS = ["Resale", "New Property", "Other"];
const OWNERSHIP_OPTIONS = ["Freehold", "Leasehold", "Co-operative Society", "Power Of Attorney", "Unknown"];
const FACING_OPTIONS = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West", "Unknown"];

function formatLocationLabel(loc: string): string {
  return loc
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface Props {
  onResult: (result: PredictionResult) => void;
}

export default function PredictionForm({ onResult }: Props) {
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [location, setLocation] = useState("");
  const [areaSqft, setAreaSqft] = useState("");
  const [currentFloor, setCurrentFloor] = useState("0");
  const [totalFloors, setTotalFloors] = useState("1");
  const [bathrooms, setBathrooms] = useState("2");
  const [balconies, setBalconies] = useState("1");
  const [parking, setParking] = useState("0");
  const [viewMainRoad, setViewMainRoad] = useState(false);
  const [viewGarden, setViewGarden] = useState(false);
  const [viewPool, setViewPool] = useState(false);
  const [furnishing, setFurnishing] = useState("Semi-Furnished");
  const [transaction, setTransaction] = useState("Resale");
  const [ownership, setOwnership] = useState("Freehold");
  const [facing, setFacing] = useState("Unknown");

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [locationsError, setLocationsError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations()
      .then((locs) => {
        setLocations(locs);
        setLocationsError(null);
      })
      .catch(() => {
        setLocations([]);
        setLocationsError("⚠️ Could not load locations — is the backend running on http://localhost:8000?");
      });
  }, []);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!location) errs.location = "Please select a location.";
    if (!areaSqft || Number(areaSqft) <= 0) errs.areaSqft = "Area must be greater than 0.";
    if (Number(totalFloors) < 1) errs.totalFloors = "Total floors must be ≥ 1.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    const req: PredictionRequest = {
      location,
      area_sqft: Number(areaSqft),
      current_floor: Number(currentFloor),
      total_floors: Number(totalFloors),
      bathroom_num: Number(bathrooms),
      balcony_num: Number(balconies),
      car_parking_num: Number(parking),
      view_main_road: viewMainRoad ? 1 : 0,
      view_garden_park: viewGarden ? 1 : 0,
      view_pool: viewPool ? 1 : 0,
      furnishing,
      transaction,
      ownership,
      facing,
    };

    try {
      const resp = await predictPrice(req);
      // onResult is provided by HomePage which navigates to /result with state
      onResult({ ...resp, request: req });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Prediction failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="prediction-form" onSubmit={handleSubmit} noValidate id="prediction-form">
      <div className="form-section">
        <h3 className="section-title">📍 Location & Area</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="location-select">City / Location *</label>
            <select
              id="location-select"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={fieldErrors.location ? "error" : ""}
            >
              <option value="">— Select location —</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {formatLocationLabel(loc)}
                </option>
              ))}
            </select>
            {fieldErrors.location && <span className="field-error">{fieldErrors.location}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="area-input">Carpet Area (sqft) *</label>
            <input
              id="area-input"
              type="number"
              min="1"
              placeholder="e.g. 1200"
              value={areaSqft}
              onChange={(e) => setAreaSqft(e.target.value)}
              className={fieldErrors.areaSqft ? "error" : ""}
            />
            {fieldErrors.areaSqft && <span className="field-error">{fieldErrors.areaSqft}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="current-floor-input">Current Floor</label>
            <input
              id="current-floor-input"
              type="number"
              min="-2"
              placeholder="0 = Ground"
              value={currentFloor}
              onChange={(e) => setCurrentFloor(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="total-floors-input">Total Floors *</label>
            <input
              id="total-floors-input"
              type="number"
              min="1"
              placeholder="e.g. 10"
              value={totalFloors}
              onChange={(e) => setTotalFloors(e.target.value)}
              className={fieldErrors.totalFloors ? "error" : ""}
            />
            {fieldErrors.totalFloors && <span className="field-error">{fieldErrors.totalFloors}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">🏠 Property Details</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="bathrooms-input">Bathrooms</label>
            <input id="bathrooms-input" type="number" min="0" max="20" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="balconies-input">Balconies</label>
            <input id="balconies-input" type="number" min="0" max="20" value={balconies} onChange={(e) => setBalconies(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="parking-input">Car Parking</label>
            <input id="parking-input" type="number" min="0" max="20" value={parking} onChange={(e) => setParking(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="facing-select">Facing Direction</label>
            <select id="facing-select" value={facing} onChange={(e) => setFacing(e.target.value)}>
              {FACING_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">✨ Amenities & Type</h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="furnishing-select">Furnishing</label>
            <select id="furnishing-select" value={furnishing} onChange={(e) => setFurnishing(e.target.value)}>
              {FURNISHING_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="transaction-select">Transaction Type</label>
            <select id="transaction-select" value={transaction} onChange={(e) => setTransaction(e.target.value)}>
              {TRANSACTION_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="ownership-select">Ownership</label>
            <select id="ownership-select" value={ownership} onChange={(e) => setOwnership(e.target.value)}>
              {OWNERSHIP_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="checkbox-group">
          <p className="checkbox-label">Overlooking</p>
          <label className="checkbox-item">
            <input id="view-main-road" type="checkbox" checked={viewMainRoad} onChange={(e) => setViewMainRoad(e.target.checked)} />
            <span>Main Road</span>
          </label>
          <label className="checkbox-item">
            <input id="view-garden" type="checkbox" checked={viewGarden} onChange={(e) => setViewGarden(e.target.checked)} />
            <span>Garden / Park</span>
          </label>
          <label className="checkbox-item">
            <input id="view-pool" type="checkbox" checked={viewPool} onChange={(e) => setViewPool(e.target.checked)} />
            <span>Pool</span>
          </label>
        </div>
      </div>

      {error && <div className="api-error" role="alert">⚠️ {error}</div>}

      <button
        id="predict-button"
        type="submit"
        className={`predict-btn ${loading ? "loading" : ""}`}
        disabled={loading}
      >
        {loading ? (
          <span className="btn-inner">
            <span className="spinner" /> Predicting…
          </span>
        ) : (
          <span className="btn-inner">🔮 Predict Price</span>
        )}
      </button>
    </form>
  );
}
