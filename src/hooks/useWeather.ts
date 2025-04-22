
import { useState, useEffect } from 'react';
import { WeatherData, getWeatherByCurrentLocation, getWeatherByCity } from '@/utils/weatherService';

interface UseWeatherProps {
  city?: string;
  useCurrentLocation?: boolean;
}

export function useWeather({ city, useCurrentLocation = true }: UseWeatherProps = {}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      setError(null);
      
      try {
        let weatherData: WeatherData;
        
        if (city) {
          weatherData = await getWeatherByCity(city);
        } else if (useCurrentLocation) {
          weatherData = await getWeatherByCurrentLocation();
        } else {
          throw new Error('Either city or useCurrentLocation must be provided');
        }
        
        setWeather(weatherData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [city, useCurrentLocation]);

  return { weather, loading, error };
}
