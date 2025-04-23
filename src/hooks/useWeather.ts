
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
          weatherData = await getWeatherByCurrentLocation();
        } else {
          weatherData = await getWeatherByCity(city);
        }
        
        setWeather(weatherData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
        setError(errorMessage);
        
        if (errorMessage.includes('Geolocation permission denied')) {
          toast.error("Please enable location access to get current weather");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [city]);

  return { weather, loading, error };
}
