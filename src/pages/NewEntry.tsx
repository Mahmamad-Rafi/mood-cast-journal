import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useWeather } from "@/hooks/useWeather";
import { getWeatherIconUrl } from "@/utils/weatherService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { saveEntry } from "@/utils/storage";
import { MOODS, getMoodBackgroundClass } from "@/types/mood";

const NewEntry = () => {
  const navigate = useNavigate();
  const { weather, loading, error } = useWeather();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
  };

  const handleSubmit = () => {
    if (!selectedMood) {
      toast.error("Please select a mood");
      return;
    }

    if (!note.trim()) {
      toast.error("Please enter a note");
      return;
    }

    if (!weather) {
      toast.error("Weather data is not available yet");
      return;
    }

    setIsSubmitting(true);

    try {
      const newEntry = {
        id: uuidv4(),
        date: new Date().toISOString(),
        mood: selectedMood,
        note: note.trim(),
        weather: {
          temperature: weather.main.temp,
          condition: weather.weather[0].main,
          icon: weather.weather[0].icon,
          location: `${weather.name}, ${weather.sys.country}`,
        },
      };

      saveEntry(newEntry);
      toast.success("Entry saved successfully!");
      navigate("/entries");
    } catch (err) {
      toast.error("Failed to save entry");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen py-8 px-4 transition-colors duration-300 ${getMoodBackgroundClass(selectedMood)}`}>
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-4"
        >
          ← Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              How are you feeling today?
              <div className="text-lg font-normal mt-1 text-gray-500">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* Weather display */}
            {loading ? (
              <div className="text-center mb-6">Loading weather data...</div>
            ) : error ? (
              <div className="text-center mb-6 text-red-500">
                Could not load weather: {error}
              </div>
            ) : weather ? (
              <div className="text-center mb-6 flex items-center justify-center gap-2">
                <img 
                  src={getWeatherIconUrl(weather.weather[0].icon)} 
                  alt={weather.weather[0].description}
                  width={40}
                  height={40}
                />
                <span>
                  {Math.round(weather.main.temp)}°C, {weather.weather[0].description} in {weather.name}
                </span>
              </div>
            ) : null}

            {/* Mood selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select your mood:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(MOODS).map(([key, { emoji, label }]) => (
                  <button
                    key={key}
                    onClick={() => handleMoodSelect(key as MoodType)}
                    className={`p-3 rounded-md flex flex-col items-center transition-all ${
                      selectedMood === key
                        ? "ring-2 ring-primary scale-110 shadow-md"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-3xl mb-1">{emoji}</span>
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a note about your day:
              </label>
              <Textarea
                placeholder="How was your day? What made you feel this way?"
                className="min-h-[120px] resize-none"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button 
              onClick={handleSubmit} 
              className="w-full py-6 text-lg"
              disabled={isSubmitting || !selectedMood || !note.trim() || loading || !!error}
            >
              {isSubmitting ? "Saving..." : "Save Entry"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default NewEntry;
