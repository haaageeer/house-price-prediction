import type { PredictionRequest, PredictionResponse } from "../types/prediction";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export async function fetchLocations(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/locations`);
  if (!res.ok) throw new Error(`Failed to fetch locations: ${res.status} ${res.statusText}`);
  const data = await res.json();
  // Backend returns { locations: [...] }  — guard against plain array too
  if (Array.isArray(data)) return data as string[];
  if (Array.isArray(data?.locations)) return data.locations as string[];
  console.error("[fetchLocations] Unexpected response shape:", data);
  return [];
}

export async function predictPrice(
  body: PredictionRequest
): Promise<PredictionResponse> {
  const res = await fetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(
      typeof err.detail === "string"
        ? err.detail
        : JSON.stringify(err.detail)
    );
  }
  return res.json();
}
