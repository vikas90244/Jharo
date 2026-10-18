import { api } from "@/lib/api";

export interface ActivityDay {
  date: string;
  words_learned: number;
  pages_read: number;
}

export interface LearningActivity {
  year: number;
  streak: number;
  days: ActivityDay[];
}

export interface ActivityDayDetail {
  date: string;
  words: string[];
  words_learned: number;
  pages_read: number;
  pages: { title: string; page_number: number }[];
}

export interface WordMeaningResult {
  word: string;
  definition: string;
  part_of_speech: string;
  phonetic: string;
  example: string;
  source_name: string;
  source_url: string;
  newly_learned: boolean;
  words_learned: number;
}

export function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLearningActivity(year: number, today: string) {
  return api<LearningActivity>(`/resources/activity/?year=${year}&today=${today}`);
}

export function getLearningActivityDay(day: string) {
  return api<ActivityDayDetail>(`/resources/activity/${day}/`);
}

export function recordLearnedWord(word: string) {
  return api<WordMeaningResult>("/resources/activity/words/", {
    method: "POST",
    body: JSON.stringify({ word, date: localDateString() }),
  });
}

export function recordPageRead(resourceId: number, pageNumber: number, date: string) {
  return api<{ message: string }>("/resources/activity/pages/", {
    method: "POST",
    body: JSON.stringify({ resource_id: resourceId, page_number: pageNumber, date }),
  });
}
