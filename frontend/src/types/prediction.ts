export interface PredictionRequest {
  location: string;
  area_sqft: number;
  current_floor: number;
  total_floors: number;
  bathroom_num: number;
  balcony_num: number;
  car_parking_num: number;
  view_main_road: 0 | 1;
  view_garden_park: 0 | 1;
  view_pool: 0 | 1;
  furnishing: string;
  transaction: string;
  ownership: string;
  facing: string;
}

export interface PredictionResponse {
  predicted_price: number;
  price_display: string;
  location: string;
  area_sqft: number;
}

export interface PredictionResult extends PredictionResponse {
  request: PredictionRequest;
}
