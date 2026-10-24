import { isA2Core, lessonBand, bookKey } from "./cefr";
import { lessons, schedule } from "./schedule";
import type { ProgressState } from "./types";

export function computeStats(progress: ProgressState) {
  const first = new Set(progress.lessonFirstDone);
  const second = new Set(progress.lessonSecondDone);
  const totalLessons = lessons.length;
  const firstDone = first.size;
  const a2Lessons = lessons.filter(isA2Core);
  const a2Done = a2Lessons.filter((l) => first.has(l.id)).length;
  const a2Minutes = a2Lessons.reduce((s, l) => s + l.totalMinutes, 0);
  const a2DoneMinutes = a2Lessons
    .filter((l) => first.has(l.id))
    .reduce((s, l) => s + l.totalMinutes, 0);

  const books = ["everyday", "advance1", "advance2"].map((key) => {
    const group = lessons.filter((l) => bookKey(l) === key);
    const done = group.filter((l) => first.has(l.id)).length;
    return {
      key,
      label:
        key === "everyday" ? "پوشه ۱ Everyday" : key === "advance1" ? "پوشه ۲ Advance 1" : "پوشه ۳ Advance 2",
      done,
      total: group.length,
      percent: group.length ? Math.round((done / group.length) * 100) : 0,
    };
  });

  const bands = (["A1", "A2", "A2+", "B1"] as const).map((band) => {
    const group = lessons.filter((l) => lessonBand(l) === band);
    const done = group.filter((l) => first.has(l.id)).length;
    return {
      band,
      done,
      total: group.length,
      percent: group.length ? Math.round((done / group.length) * 100) : 0,
    };
  });

  const completedDays = schedule.filter((day) =>
    day.tasks.length > 0 && day.tasks.every((t) => progress.completed.includes(t.id))
  ).length;

  return {
    totalLessons,
    firstDone,
    secondDone: second.size,
    firstPercent: Math.round((firstDone / totalLessons) * 100),
    a2Percent: a2Minutes ? Math.round((a2DoneMinutes / a2Minutes) * 100) : 0,
    a2Done,
    a2Total: a2Lessons.length,
    books,
    bands,
    planDays: schedule.length,
    completedDays,
    doneMinutes: lessons
      .filter((l) => first.has(l.id))
      .reduce((s, l) => s + l.totalMinutes, 0),
    totalMinutes: lessons.reduce((s, l) => s + l.totalMinutes, 0),
  };
}
