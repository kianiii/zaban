import { MONTHS, addDays, formatJalali, isoDate, parseIso, toJalali, weekStartSunday } from "./jalali";
import { getLesson } from "./catalog";
import { schedule } from "./schedule";
import type { DayPlan, ProgressState } from "./types";

export type DayScore = {
  iso: string;
  jalali: string;
  weekday: string;
  planned: number;
  done: number;
  plannedMinutes: number;
  doneMinutes: number;
  newLessons: number;
  percent: number;
};

export type PeriodScore = {
  title: string;
  range: string;
  days: DayScore[];
  planned: number;
  done: number;
  plannedMinutes: number;
  doneMinutes: number;
  newLessons: number;
  completeDays: number;
  percent: number;
};

function scoreDay(day: DayPlan | undefined, iso: string, completed: Set<string>): DayScore {
  const tasks = day?.tasks ?? [];
  const doneTasks = tasks.filter((task) => completed.has(task.id));
  const plannedMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  const doneMinutes = doneTasks.reduce((sum, task) => sum + task.minutes, 0);
  const newLessons = doneTasks.filter((task) => task.kind === "new" || task.kind === "second").length;
  const date = parseIso(iso);
  return {
    iso,
    jalali: day?.jalali || formatJalali(date),
    weekday: day?.weekday || "",
    planned: tasks.length,
    done: doneTasks.length,
    plannedMinutes,
    doneMinutes,
    newLessons,
    percent: tasks.length ? Math.round((doneTasks.length / tasks.length) * 100) : 0,
  };
}

function pack(title: string, range: string, days: DayScore[]): PeriodScore {
  const planned = days.reduce((sum, day) => sum + day.planned, 0);
  const done = days.reduce((sum, day) => sum + day.done, 0);
  return {
    title,
    range,
    days,
    planned,
    done,
    plannedMinutes: days.reduce((sum, day) => sum + day.plannedMinutes, 0),
    doneMinutes: days.reduce((sum, day) => sum + day.doneMinutes, 0),
    newLessons: days.reduce((sum, day) => sum + day.newLessons, 0),
    completeDays: days.filter((day) => day.planned > 0 && day.done === day.planned).length,
    percent: planned ? Math.round((done / planned) * 100) : 0,
  };
}

export function weeklyScore(progress: ProgressState, aroundIso: string): PeriodScore {
  const completed = new Set(progress.completed);
  const start = weekStartSunday(parseIso(aroundIso));
  const days: DayScore[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(start, i);
    const iso = isoDate(date);
    days.push(scoreDay(schedule.find((item) => item.iso === iso), iso, completed));
  }
  return pack("داشبورد هفتگی", `${days[0].jalali} تا ${days[6].jalali}`, days);
}

export function monthlyScore(progress: ProgressState, aroundIso: string): PeriodScore {
  const completed = new Set(progress.completed);
  const around = toJalali(parseIso(aroundIso));
  const days = schedule
    .filter((day) => {
      const j = toJalali(parseIso(day.iso));
      return j.y === around.y && j.m === around.m;
    })
    .map((day) => scoreDay(day, day.iso, completed));
  return pack("داشبورد ماهانه", `${MONTHS[around.m - 1]} ${around.y}`, days);
}

export function periodLessonNames(progress: ProgressState, days: DayScore[]) {
  const isos = new Set(days.map((day) => day.iso));
  const names: string[] = [];
  for (const day of schedule) {
    if (!isos.has(day.iso)) continue;
    for (const task of day.tasks) {
      if (!progress.completed.includes(task.id) || !task.lessonId) continue;
      const lesson = getLesson(task.lessonId);
      if (lesson) names.push(`${lesson.chapter} / ${lesson.title}`);
    }
  }
  return [...new Set(names)].slice(0, 8);
}
