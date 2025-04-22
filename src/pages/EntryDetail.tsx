
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getEntryById, deleteEntry } from "@/utils/storage";
import { getWeatherIconUrl } from "@/utils/weatherService";
import { MoodType, MOODS, getMoodBackgroundClass } from "@/types/mood";

const EntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      const foundEntry = getEntryById(id);
      if (foundEntry) {
        setEntry(foundEntry);
      }
      setLoading(false);
    }
  }, [id]);
  
  const handleDelete = () => {
    if (id) {
      deleteEntry(id);
      navigate("/entries");
    }
  };
  
  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }
  
  if (!entry) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl mb-4">Entry not found</h1>
        <Button onClick={() => navigate("/entries")}>Back to Entries</Button>
      </div>
    );
  }
  
  const { mood, date, note, weather } = entry;
  const parsedDate = parseISO(date);
  const moodInfo = MOODS[mood as MoodType];
  
  return (
    <div className={`min-h-screen py-8 px-4 transition-colors duration-300 ${getMoodBackgroundClass(mood)}`}>
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
            <div className="flex justify-between items-center">
              <CardTitle>{format(parsedDate, "EEEE, MMMM d, yyyy")}</CardTitle>
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete entry?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this journal entry.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-4xl mr-4">{moodInfo.emoji}</span>
                <span className="text-xl font-medium">{moodInfo.label}</span>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    View Weather
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Weather on {format(parsedDate, "MMM d, yyyy")}</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center p-4">
                    <img 
                      src={getWeatherIconUrl(weather.icon)} 
                      alt={weather.condition}
                      width={80}
                      height={80}
                    />
                    <div className="text-center mt-2">
                      <div className="text-2xl font-bold">
                        {Math.round(weather.temperature)}°C
                      </div>
                      <div className="text-lg capitalize">
                        {weather.condition}
                      </div>
                      <div className="text-gray-500">
                        {weather.location}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Journal Note:</h3>
              <div className="bg-white/50 p-4 rounded-md whitespace-pre-wrap">
                {note}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <img 
                src={getWeatherIconUrl(weather.icon)} 
                alt={weather.condition}
                width={25}
                height={25}
              />
              <span>{Math.round(weather.temperature)}°C, {weather.location}</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default EntryDetail;
