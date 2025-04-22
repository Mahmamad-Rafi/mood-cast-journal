
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useWeather } from "@/hooks/useWeather";
import { getWeatherIconUrl } from "@/utils/weatherService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getAllEntries } from "@/utils/storage";
import { MoodEntry, MOODS, MoodType } from "@/types/mood";

const Home = () => {
  const navigate = useNavigate();
  const { weather, loading, error } = useWeather();
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);

  useEffect(() => {
    const entries = getAllEntries();
    // Sort by date descending and take the 5 most recent
    const recent = [...entries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    setRecentEntries(recent);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Mood Journal</h1>
      
      {/* Current Date */}
      <div className="text-center mb-8">
        <div className="text-xl font-semibold">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </div>
      </div>

      {/* Weather Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Today's Weather</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          {loading ? (
            <p>Loading weather data...</p>
          ) : error ? (
            <p className="text-red-500">Failed to load weather: {error}</p>
          ) : weather ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                {weather.weather[0]?.icon && (
                  <img 
                    src={getWeatherIconUrl(weather.weather[0].icon)} 
                    alt={weather.weather[0].description}
                    width={50}
                    height={50}
                  />
                )}
                <span className="text-2xl font-bold">{Math.round(weather.main.temp)}°C</span>
              </div>
              <p className="text-gray-700 capitalize">{weather.weather[0]?.description}</p>
              <p className="text-sm text-gray-500">{weather.name}, {weather.sys.country}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button 
          onClick={() => navigate("/new-entry")} 
          className="flex-1 text-lg py-6"
          size="lg"
        >
          Add Today's Mood
        </Button>
        <Button 
          onClick={() => navigate("/entries")} 
          className="flex-1 text-lg py-6"
          variant="outline"
          size="lg"
        >
          View All Entries
        </Button>
        <Button 
          onClick={() => navigate("/statistics")} 
          className="flex-1 text-lg py-6"
          variant="secondary"
          size="lg"
        >
          View Statistics
        </Button>
      </div>

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Entries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentEntries.map((entry) => (
              <Card key={entry.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/entry/${entry.id}`)}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{format(new Date(entry.date), "MMM d, yyyy")}</span>
                    <span className="text-2xl">{MOODS[entry.mood as MoodType]?.emoji}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 line-clamp-2">{entry.note}</p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center text-sm text-gray-500">
                    <img 
                      src={getWeatherIconUrl(entry.weather.icon)} 
                      alt={entry.weather.condition}
                      width={25}
                      height={25}
                      className="mr-2"
                    />
                    <span>{Math.round(entry.weather.temperature)}°C</span>
                    <span className="ml-2">{entry.weather.location}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
