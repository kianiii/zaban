import lessonsData from "../data/lessons.json";
import metaData from "../data/lesson-meta.json";
import type { Lesson } from "./types";

export const lessons = lessonsData as Lesson[];
export const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));

export type LessonMeta = {
  focus: string;
  source: string;
  sentences: number;
  words: number;
  proverb: number;
  conversation: number;
};

export type LessonPlace = {
  folder: number;
  book: string;
  session: string;
  voice: string;
  path: string;
};

const meta = metaData as Record<string, LessonMeta>;

export function getLesson(id: number) {
  return lessonById.get(id) ?? null;
}

export function lessonMeta(id: number): LessonMeta | null {
  return meta[String(id)] ?? null;
}

export function folderNumber(lesson: Lesson) {
  if (lesson.book.includes("Advance 2")) return 3;
  if (lesson.book.includes("Advance 1")) return 2;
  return 1;
}

export function locate(lesson: Lesson): LessonPlace {
  const folder = folderNumber(lesson);
  return {
    folder,
    book: lesson.book,
    session: lesson.chapter,
    voice: lesson.title,
    path: `پوشه ${folder} / ${lesson.chapter} / ویس ${lesson.title}`,
  };
}

export function lessonsInChapter(chapter: string, bookHint?: string) {
  return lessons.filter(
    (lesson) => lesson.chapter === chapter && (!bookHint || lesson.book.includes(bookHint))
  );
}
