
import { useState, useEffect } from 'react';
import { WeatherData, getWeatherByCurrentLocation, getWeatherByCity } from '@/utils/weatherService';
import { toast } from "sonner";

export function useWeather({ city = "current" }: { city?: string } = {}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      setError(null);
      
      try {
        let weatherData: WeatherData;
        
        if (city === "current") {
          console.log("Fetching weather for precise live location");
          toast.info("Accessing your live location for precise weather data...");
          weatherData = await getWeatherByCurrentLocation();
          console.log("Current location weather data:", weatherData);
        } else {
          console.log(`Fetching weather for city: ${city}`);
          weatherData = await getWeatherByCity(city);
          console.log(`Weather data for ${city}:`, weatherData);
        }
        
        setWeather(weatherData);
        
        if (city === "current") {
          // Show more descriptive success message with location name
          const locationName = weatherData.name + (weatherData.sys?.country ? `, ${weatherData.sys.country}` : '');
          toast.success(`Weather updated for your location: ${locationName}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
        console.error("Weather fetch error:", errorMessage);
        setError(errorMessage);
        
        if (errorMessage.includes('Geolocation permission denied')) {
          toast.error("Please enable location access in your browser settings to get your exact location weather");
        } else if (errorMessage.includes('Unable to determine')) {
          toast.error("Could not determine your exact location. Please ensure your GPS is enabled or select a specific city instead.");
        } else if (errorMessage.includes('Geolocation timed out')) {
          toast.error("Location detection timed out. Your GPS signal may be weak. Please try again or select a specific city.");
        } else {
          toast.error("Could not load weather data for your precise location. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [city]);

  return { weather, loading, error };
}
