import type { Lesson } from "./types";

export type CefrBand = "A1" | "A2" | "A2+" | "B1";

const CHAPTER_BAND: Record<string, CefrBand> = {
  "1-Greeting": "A1",
  "2-Using look + adj": "A1",
  "3-Would like": "A2",
  "4-Could you, Shall I": "A2",
  "5-Have-has got": "A2",
  "6-What have you got": "A2",
  "7-Present continuous": "A2",
  "8-Definite future": "A2",
  "9-Indefinite future": "A2",
  "10-Simple present sentences  I": "A2",
  "11-Simple present sentences  II": "A2",
  "12-Simple present vs. definite future": "A2",
  "13-Was & Were": "A2",
  "14-Simple past sentences": "A2",
  "15-Past continuous sentences": "A2",
  "16-Passive sentences": "A2+",
  "17-Present perfect sentences": "A2+",
  "18-The Sing of present perfect": "A2+",
};

export function lessonBand(lesson: Lesson): CefrBand {
  if (lesson.book.includes("Advance 2")) return "B1";
  if (lesson.book.includes("Advance 1")) return "A2+";
  return CHAPTER_BAND[lesson.chapter] ?? "A2";
}

export function isA2Core(lesson: Lesson) {
  const band = lessonBand(lesson);
  return band === "A2" || band === "A2+";
}

export function bookKey(lesson: Lesson) {
  if (lesson.book.includes("Everyday")) return "everyday";
  if (lesson.book.includes("Advance 1")) return "advance1";
  return "advance2";
}
