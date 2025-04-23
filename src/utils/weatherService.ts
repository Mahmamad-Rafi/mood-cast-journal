
/**
 * Weather Service - Handles all weather API interactions
 */
import { 
  GeocodingResult, 
  getCurrentLocation, 
  getReverseGeocoding,
  findBestLocation
} from "./locationService";

// API key for OpenWeatherMap
const API_KEY = "02e2cec63096e9aac69ce909ca8fe7a7";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

/**
 * Weather data structure
 */
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
