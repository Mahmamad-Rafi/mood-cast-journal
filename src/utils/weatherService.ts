
/**
 * Weather Service - Handles all weather API interactions
 */

// API key for OpenWeatherMap
const API_KEY = "02e2cec63096e9aac69ce909ca8fe7a7";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

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
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
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
 * Get user's current location using browser geolocation API
 */
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    
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
      { timeout: 10000, enableHighAccuracy: true }
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
 * Convenience function to get weather by current location
 */
export const getWeatherByCurrentLocation = async (): Promise<WeatherData> => {
  try {
    const position = await getCurrentLocation();
    return await getWeatherByCoords(
      position.coords.latitude, 
      position.coords.longitude
    );
  } catch (error) {
    console.error("Failed to get weather by current location:", error);
    throw error;
  }
};
