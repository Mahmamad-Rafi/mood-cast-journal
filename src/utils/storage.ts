
import { MoodEntry } from "@/types/mood";

const STORAGE_KEY = "mood-journal-entries";

export const saveEntry = (entry: MoodEntry): void => {
  const entries = getAllEntries();
  entries.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const getAllEntries = (): MoodEntry[] => {
  const entriesJson = localStorage.getItem(STORAGE_KEY);
  return entriesJson ? JSON.parse(entriesJson) : [];
};

export const getEntryById = (id: string): MoodEntry | undefined => {
  const entries = getAllEntries();
  return entries.find(entry => entry.id === id);
};

export const deleteEntry = (id: string): void => {
  let entries = getAllEntries();
  entries = entries.filter(entry => entry.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const updateEntry = (updatedEntry: MoodEntry): void => {
  let entries = getAllEntries();
  entries = entries.map(entry => 
    entry.id === updatedEntry.id ? updatedEntry : entry
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};
