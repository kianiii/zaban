import data from "../data/learnables.json";
import { lessons } from "./schedule";

export type Pair = { fa: string; en: string };

export type LessonContent = {
  focus: string;
  source: string;
  sentences: Pair[];
  words: Pair[];
  proverb: Pair[];
  conversation: string[];
};

const byId = data.byId as Record<string, LessonContent>;

export function lessonContent(id: number): LessonContent | null {
  return byId[String(id)] ?? null;
}

export function chapterContent(chapter: string): LessonContent {
  const group = lessons.filter((lesson) => lesson.chapter === chapter);
  const merged: LessonContent = {
    focus: (data.sessionFa as Record<string, string>)[chapter] || chapter,
    source: group[0] ? lessonContent(group[0].id)?.source || "مکالمه میرزایی" : "مکالمه میرزایی",
    sentences: [],
    words: [],
    proverb: [],
    conversation: [],
  };
  for (const lesson of group) {
    const item = lessonContent(lesson.id);
    if (!item) continue;
    merged.sentences.push(...item.sentences);
    merged.words.push(...item.words);
    merged.proverb.push(...item.proverb);
    merged.conversation.push(...item.conversation);
  }
  return merged;
}
