/**
 * Location Service - Handles geolocation and reverse geocoding API interactions
 */
const API_KEY = "02e2cec63096e9aac69ce909ca8fe7a7";
const GEO_URL = "https://api.openweathermap.org/geo/1.0";

export interface GeocodingResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

/**
 * Reverse geocoding to get precise location name from coordinates
 * We're using OpenWeatherMap's geocoding API as it's free and already set up
 */
export const getReverseGeocoding = async (
  lat: number, 
  lon: number
): Promise<GeocodingResult[]> => {
  try {
    console.log(`Performing reverse geocoding with coordinates: ${lat}, ${lon}`);
    const response = await fetch(
      `${GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`);
    }
    
    const results = await response.json();
    console.log("Reverse geocoding results:", results);
    return results;
  } catch (error) {
    console.error("Failed to reverse geocode location:", error);
    throw error;
  }
};

/**
 * Get user's current location using browser geolocation API
 * with maximum accuracy settings and a very long timeout
 */
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    
    // Clear any cached positions first
    navigator.geolocation.clearWatch(navigator.geolocation.watchPosition(() => {}));
    
    // Request highest possible accuracy with absolutely no cached data
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Raw geolocation position received:", position);
        console.log(`Coordinates: ${position.coords.latitude}, ${position.coords.longitude}`);
        console.log(`Accuracy: ${position.coords.accuracy} meters`);
        resolve(position);
      },
      (error) => {
        console.error("Geolocation error:", error);
        
        // Convert GeolocationPositionError to more user-friendly messages
        if (error.code === 1) {
          reject(new Error("Geolocation permission denied"));
        } else if (error.code === 2) {
          reject(new Error("Unable to determine your location"));
        } else {
          reject(new Error("Geolocation timed out"));
        }
      },
      { 
        timeout: 60000,          // Extended timeout (60 seconds) for better accuracy
        enableHighAccuracy: true, // Request high accuracy
        maximumAge: 0            // Don't use cached position data
      }
    );
  });
};

/**
 * Find the most specific location from geocoding results
 */
export const findBestLocation = (results: GeocodingResult[]): GeocodingResult | null => {
  if (!results || results.length === 0) return null;
  
  // Try to find locations with more specific information (having state property)
  const specificLocations = results.filter(loc => !!loc.state);
  if (specificLocations.length > 0) return specificLocations[0];
  
  // Otherwise return the first result
  return results[0];
};
