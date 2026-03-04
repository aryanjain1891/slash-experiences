export interface CityCoords {
  lat: number;
  lng: number;
}

export const CITY_COORDINATES: Record<string, CityCoords> = {
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  "New Delhi": { lat: 28.6139, lng: 77.209 },
  Gurgaon: { lat: 28.4595, lng: 77.0266 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Gandhinagar: { lat: 23.2156, lng: 72.6369 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Lucknow: { lat: 26.8467, lng: 80.9462 },
  Indore: { lat: 22.7196, lng: 75.8577 },
  Chandigarh: { lat: 30.7333, lng: 76.7794 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Bhopal: { lat: 23.2599, lng: 77.4126 },
  Shimla: { lat: 31.1048, lng: 77.1734 },
  Dehradun: { lat: 30.3165, lng: 78.0322 },
  Thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Kochi: { lat: 9.9312, lng: 76.2673 },
  Goa: { lat: 15.2993, lng: 74.124 },
  Varanasi: { lat: 25.3176, lng: 82.9739 },
  Udaipur: { lat: 24.5854, lng: 73.7125 },
  Mysore: { lat: 12.2958, lng: 76.6394 },
  Coimbatore: { lat: 11.0168, lng: 76.9558 },
  Surat: { lat: 21.1702, lng: 72.8311 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  Visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  Patna: { lat: 25.6093, lng: 85.1376 },
  Amritsar: { lat: 31.634, lng: 74.8723 },
  Ranchi: { lat: 23.3441, lng: 85.3096 },
  Guwahati: { lat: 26.1445, lng: 91.7362 },
  Jodhpur: { lat: 26.2389, lng: 73.0243 },
  Madurai: { lat: 9.9252, lng: 78.1198 },
  Noida: { lat: 28.5355, lng: 77.391 },
};

/**
 * Haversine distance between two geographic points in kilometres.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Human-readable distance string.
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/**
 * Read the selected city from localStorage (`selected_city` key).
 */
export function getSelectedCity(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("selected_city");
}

/**
 * Persist city selection.
 */
export function setSelectedCity(city: string | null) {
  if (typeof window === "undefined") return;
  if (city) {
    localStorage.setItem("selected_city", city);
  } else {
    localStorage.removeItem("selected_city");
  }
}
