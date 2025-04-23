
/**
 * Weather Service - Handles all weather API interactions
 */

// API key for OpenWeatherMap
const API_KEY = "02e2cec63096e9aac69ce909ca8fe7a7";
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const GEO_URL = "https://api.openweathermap.org/geo/1.0";

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
 */
export const getReverseGeocoding = async (
  lat: number, 
  lon: number
): Promise<GeocodingResult[]> => {
  try {
    const response = await fetch(
      `${GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to reverse geocode location:", error);
    throw error;
  }
};

/**
 * Get user's current location using browser geolocation API
 * with maximum accuracy settings
 */
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    
    // Request highest possible accuracy with no cached data
    navigator.geolocation.getCurrentPosition(
      resolve,
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
        timeout: 30000,       // Extended timeout for better accuracy
        enableHighAccuracy: true,  // Request high accuracy
        maximumAge: 0         // Don't use cached position data
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
    
    // Try to get precise location name using reverse geocoding
    try {
      const geocodingResults = await getReverseGeocoding(latitude, longitude);
      
      if (geocodingResults && geocodingResults.length > 0) {
        const locationInfo = geocodingResults[0];
        console.log("Reverse geocoding result:", locationInfo);
        
        // Get weather data using coordinates
        const weatherData = await getWeatherByCoords(latitude, longitude);
        
        // Override the location name with more precise data if available
        if (locationInfo.name) {
          weatherData.name = locationInfo.name;
          
          // Include state/region in name for better identification
          if (locationInfo.state) {
            weatherData.name = `${locationInfo.name}, ${locationInfo.state}`;
          }
          
          if (locationInfo.country) {
            weatherData.sys.country = locationInfo.country;
          }
        }
        
        return weatherData;
      }
    } catch (geoError) {
      console.error("Reverse geocoding failed:", geoError);
      // Continue with coordinate-based weather if geocoding fails
    }
    
    // Fallback to coordinate-based weather without location name enhancement
    return await getWeatherByCoords(latitude, longitude);
  } catch (error) {
    console.error("Failed to get weather by current location:", error);
    throw error;
  }
};
