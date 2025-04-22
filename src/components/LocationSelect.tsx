
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

const CITIES = [
  { value: "current", label: "Current Location" },
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
          <MapPin className="h-4 w-4" />
          <SelectValue placeholder="Select location" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {CITIES.map((city) => (
          <SelectItem key={city.value} value={city.value}>
            {city.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LocationSelect;
