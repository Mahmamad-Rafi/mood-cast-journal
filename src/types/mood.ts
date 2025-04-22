
export type MoodType = "happy" | "excited" | "neutral" | "sad" | "angry";

export interface MoodEntry {
  id: string;
  date: string; // ISO date string
  mood: MoodType;
  note: string;
  weather: {
    temperature: number;
    condition: string;
    icon: string;
    location: string;
  };
}

export const MOODS = {
  happy: {
    emoji: "😊",
    label: "Happy",
    color: "#FFD700" // Gold
  },
  excited: {
    emoji: "🤩",
    label: "Excited",
    color: "#FF8C00" // Dark Orange
  },
  neutral: {
    emoji: "😐",
    label: "Neutral",
    color: "#87CEEB" // Sky Blue
  },
  sad: {
    emoji: "😔",
    label: "Sad",
    color: "#6495ED" // Cornflower Blue
  },
  angry: {
    emoji: "😠",
    label: "Angry",
    color: "#FF6347" // Tomato
  }
};

export const getMoodBackgroundClass = (mood: MoodType | null): string => {
  switch(mood) {
    case "happy": return "bg-amber-50";
    case "excited": return "bg-orange-50";
    case "neutral": return "bg-sky-50";
    case "sad": return "bg-blue-50";
    case "angry": return "bg-red-50";
    default: return "bg-gray-50";
  }
};
