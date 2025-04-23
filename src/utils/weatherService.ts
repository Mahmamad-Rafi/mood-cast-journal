/**
 * Weather Service - Handles all weather API interactions
 */

// API key for OpenWeatherMap
const API_KEY = "02e2cec63096e9aac69ce909ca8fe7a7";
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const GEO_URL = "https://api.openweathermap.org/geo/1.0";

// Adding Google's reverse geocoding API for more accurate location detection
const GOOGLE_GEOCODE_API = "https://maps.googleapis.com/maps/api/geocode/json";
const GOOGLE_API_KEY = ""; // We'll use OpenWeatherMap's geocoding instead

export interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
  sys: {
    country: string;
  };
  dt: number;
}

export interface GeocodingResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

/**
 * Get weather data by city name
 */
export const getWeatherByCity = async (city: string): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    throw error;
  }
};

/**
 * Get weather data by geolocation coordinates
 */
export const getWeatherByCoords = async (
  lat: number,
  lon: number
): Promise<WeatherData> => {
  try {
    // Using max precision settings for more accurate location-based weather
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&cnt=1`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    throw error;
  }
};

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
 * Get weather icon URL from icon code
 */
export const getWeatherIconUrl = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

/**
 * Find the most specific location from geocoding results
 * Prioritizes smaller localities over larger regions
 */
const findBestLocation = (results: GeocodingResult[]): GeocodingResult | null => {
  if (!results || results.length === 0) return null;
  
  // Try to find locations with more specific information (having state property)
  const specificLocations = results.filter(loc => !!loc.state);
  if (specificLocations.length > 0) return specificLocations[0];
  
  // Otherwise return the first result
  return results[0];
};

/**
 * Enhanced function to get weather by current location with precise location name
 */
export const getWeatherByCurrentLocation = async (): Promise<WeatherData> => {
  try {
    // Get user's precise coordinates
    const position = await getCurrentLocation();
    const { latitude, longitude } = position.coords;
    
    console.log("Got user location with high precision:", {
      latitude,
      longitude,
      accuracy: `${position.coords.accuracy} meters`,
      timestamp: new Date(position.timestamp).toISOString()
    });
    
    // First get basic weather data
    const weatherData = await getWeatherByCoords(latitude, longitude);
    
    // Try to get precise location name using reverse geocoding
    try {
      const geocodingResults = await getReverseGeocoding(latitude, longitude);
      
      if (geocodingResults && geocodingResults.length > 0) {
        // Find the best location from results
        const bestLocation = findBestLocation(geocodingResults);
        console.log("Best location found:", bestLocation);
        
        if (bestLocation) {
          // Override the location name with more precise data
          if (bestLocation.name) {
            let locationName = bestLocation.name;
            
            // Include state/region for better identification
            if (bestLocation.state) {
              locationName = `${locationName}, ${bestLocation.state}`;
            }
            
            console.log(`Updating location from "${weatherData.name}" to "${locationName}"`);
            weatherData.name = locationName;
            
            if (bestLocation.country) {
              weatherData.sys.country = bestLocation.country;
            }
          }
        }
      }
    } catch (geoError) {
      console.error("Reverse geocoding failed:", geoError);
      // Continue with coordinate-based weather if geocoding fails
    }
    
    console.log("Final weather data with location:", weatherData);
    return weatherData;
  } catch (error) {
    console.error("Failed to get weather by current location:", error);
    throw error;
  }
};
