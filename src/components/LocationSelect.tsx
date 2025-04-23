
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Navigation } from "lucide-react";

const CITIES = [
  { value: "current", label: "My Live Location", icon: Navigation },
  { value: "hyderabad", label: "Hyderabad" },
  { value: "chennai", label: "Chennai" },
  { value: "kolkata", label: "Kolkata" },
  { value: "bengaluru", label: "Bengaluru" },
  { value: "delhi", label: "Delhi" },
  { value: "london", label: "London" },
  { value: "new york", label: "New York" },
  { value: "tokyo", label: "Tokyo" },
  { value: "paris", label: "Paris" },
  { value: "sydney", label: "Sydney" }
];

interface LocationSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const LocationSelect = ({ value, onValueChange }: LocationSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[200px]">
        <div className="flex items-center gap-2">
          {value === "current" ? <Navigation className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
          <SelectValue placeholder="Select location" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {CITIES.map((city) => (
          <SelectItem key={city.value} value={city.value} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {city.value === "current" ? (
                <Navigation className="h-4 w-4 text-blue-500" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              {city.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LocationSelect;
