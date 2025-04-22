
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format, parseISO, isAfter, startOfDay, endOfDay, startOfWeek, startOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { getWeatherIconUrl } from "@/utils/weatherService";
import { getAllEntries } from "@/utils/storage";
import { MoodEntry, MoodType, MOODS } from "@/types/mood";

type FilterPeriod = "all" | "week" | "month";
type SortOrder = "newest" | "oldest";

const Entries = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<MoodEntry[]>([]);
  const [moodFilter, setMoodFilter] = useState<MoodType | "all">("all");
  const [periodFilter, setPeriodFilter] = useState<FilterPeriod>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Get all entries from storage
  useEffect(() => {
    const allEntries = getAllEntries();
    setEntries(allEntries);
  }, []);
  
  // Apply filters
  useEffect(() => {
    let result = [...entries];
    
    // Apply mood filter
    if (moodFilter !== "all") {
      result = result.filter(entry => entry.mood === moodFilter);
    }
    
    // Apply period filter
    const now = new Date();
    if (periodFilter === "week") {
      const weekStart = startOfWeek(now);
      result = result.filter(entry => isAfter(parseISO(entry.date), weekStart));
    } else if (periodFilter === "month") {
      const monthStart = startOfMonth(now);
      result = result.filter(entry => isAfter(parseISO(entry.date), monthStart));
    }
    
    // Apply date filter
    if (selectedDate) {
      const dayStart = startOfDay(selectedDate);
      const dayEnd = endOfDay(selectedDate);
      result = result.filter(entry => {
        const entryDate = parseISO(entry.date);
        return entryDate >= dayStart && entryDate <= dayEnd;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredEntries(result);
  }, [entries, moodFilter, periodFilter, sortOrder, selectedDate]);

  // Get dates with entries for the calendar
  const datesWithEntries = entries.map(entry => parseISO(entry.date));
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Journal Entries</h1>
        <Button onClick={() => navigate("/new-entry")}>Add New Entry</Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-xl font-semibold">Filters</h2>
            <div className="flex flex-wrap gap-3">
              <Select value={moodFilter} onValueChange={(value) => setMoodFilter(value as MoodType | "all")}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All moods</SelectItem>
                  {Object.entries(MOODS).map(([key, { emoji, label }]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center">
                        <span className="mr-2">{emoji}</span>
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as FilterPeriod)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                highlighted: datesWithEntries
              }}
              modifiersClassNames={{
                highlighted: "bg-primary/20"
              }}
              footer={selectedDate && (
                <div className="text-sm text-center mt-2">
                  {format(selectedDate, "MMMM d, yyyy")}
                  <Button 
                    variant="link" 
                    onClick={() => setSelectedDate(undefined)}
                    className="ml-2 p-0 h-auto font-normal text-xs"
                  >
                    Clear
                  </Button>
                </div>
              )}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No entries found with the selected filters
          </div>
        ) : (
          filteredEntries.map(entry => (
            <Link key={entry.id} to={`/entry/${entry.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{MOODS[entry.mood as MoodType]?.emoji}</div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {format(parseISO(entry.date), "EEEE, MMMM d, yyyy")}
                      </div>
                      <p className="text-gray-600 line-clamp-1">{entry.note}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <img 
                        src={getWeatherIconUrl(entry.weather.icon)} 
                        alt={entry.weather.condition}
                        width={30}
                        height={30}
                      />
                      <span>{Math.round(entry.weather.temperature)}°C</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Entries;
