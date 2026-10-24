import lessonsData from "../data/lessons.json";
import type { DayPlan, Lesson, Task } from "./types";
import { addDays, formatJalali, isoDate, WEEKDAYS } from "./jalali";

export const lessons = lessonsData as Lesson[];
export const PLAN_START = new Date(2026, 9, 23);
export const COMPLETED_THROUGH = 15;

const lessonById = new Map(lessons.map((l) => [l.id, l]));

function lessonLabel(lesson: Lesson) {
  return `#${lesson.id} ${shortBook(lesson.book)} › ${lesson.chapter} › ${lesson.title}`;
}

function shortBook(book: string) {
  if (book.includes("Everyday")) return "پ۱";
  if (book.includes("Advance 1")) return "پ۲";
  return "پ۳";
}

function packLessons(
  queue: Lesson[],
  start: number,
  target: number,
  hardCap: number
) {
  const picked: Lesson[] = [];
  let minutes = 0;
  let i = start;
  while (i < queue.length) {
    const item = queue[i];
    if (picked.length > 0 && minutes >= target && minutes + item.totalMinutes > hardCap) {
      break;
    }
    picked.push(item);
    minutes += item.totalMinutes;
    i += 1;
    if (minutes >= target && picked.length >= 2) break;
    if (minutes >= hardCap) break;
  }
  return { picked, next: i, minutes };
}

function virtualHistory(): Record<number, number> {
  const map: Record<number, number> = {};
  for (const lesson of lessons) {
    if (lesson.id <= 5) map[lesson.id] = -2;
    else if (lesson.id <= 11) map[lesson.id] = -1;
    else if (lesson.id <= 15) map[lesson.id] = 0;
  }
  return map;
}

export function buildSchedule(): DayPlan[] {
  const remaining = lessons.filter((l) => l.id > COMPLETED_THROUGH);
  const firstListenDay = virtualHistory();
  const days: DayPlan[] = [];
  let cursor = 0;
  let dayIndex = 1;

  const method =
    "Core Lesson را کامل گوش بده و همراهش با صدای بلند تکرار کن؛ بعد Conversation را گوش بده و Context/Vocabulary را بخوان.";

  while (cursor < remaining.length) {
    const date = addDays(PLAN_START, dayIndex - 1);
    const weekday = WEEKDAYS[date.getDay()];
    const iso = isoDate(date);

    if (date.getDay() === 0) {
      const weekLessons = Object.entries(firstListenDay)
        .filter(([, d]) => d >= dayIndex - 7 && d < dayIndex)
        .map(([id]) => lessonById.get(Number(id))!)
        .filter(Boolean);
      const minutes = Math.max(50, Math.round(weekLessons.length * 3.5));
      days.push({
        day: dayIndex,
        iso,
        jalali: formatJalali(date),
        weekday,
        phase: "مرور هفتگی (سبک)",
        phaseKey: "weekly",
        listenMinutes: 0,
        reviewMinutes: minutes,
        tasks: [
          {
            id: `${iso}:weekly`,
            kind: "weekly",
            title: "مرور هفتگی",
            detail: weekLessons.length
              ? `Conversation و لغات درس‌های #${weekLessons[0].id} تا #${weekLessons.at(-1)!.id}`
              : "مرور درس‌های همین هفته و جمله‌هایی که سخت بودند",
            minutes,
            speed: "—",
          },
        ],
      });
      dayIndex += 1;
      continue;
    }

    const packed = packLessons(remaining, cursor, 100, 130);
    cursor = packed.next;
    const tasks: Task[] = packed.picked.map((lesson) => {
      firstListenDay[lesson.id] = dayIndex;
      return {
        id: `${iso}:new:${lesson.id}`,
        lessonId: lesson.id,
        kind: "new",
        title: lessonLabel(lesson),
        detail: method,
        minutes: lesson.totalMinutes,
        speed: "1x",
      };
    });

    const yesterday = Object.entries(firstListenDay)
      .filter(([, d]) => d === dayIndex - 1)
      .map(([id]) => Number(id));
    const threeAgo = Object.entries(firstListenDay)
      .filter(([, d]) => d === dayIndex - 3)
      .map(([id]) => Number(id));
    const sevenAgo = Object.entries(firstListenDay)
      .filter(([, d]) => d === dayIndex - 7)
      .map(([id]) => Number(id));

    if (yesterday.length) {
      tasks.push({
        id: `${iso}:rv:${yesterday.join("-")}`,
        kind: "review-vocab",
        title: "مرور ۱ روز بعد",
        detail: `خواندن Vocabulary + Context درس‌های ${yesterday.map((id) => `#${id}`).join("، ")}`,
        minutes: yesterday.length * 3,
        speed: "—",
      });
    }
    if (threeAgo.length) {
      tasks.push({
        id: `${iso}:r3:${threeAgo.join("-")}`,
        kind: "review-conversation",
        title: "مرور ۳ روز بعد",
        detail: `گوش دادن دوباره Conversation + نگاه سریع به لغات ${threeAgo.map((id) => `#${id}`).join("، ")}`,
        minutes: Math.max(8, threeAgo.length * 2),
        speed: "1x",
      });
    }
    if (sevenAgo.length) {
      tasks.push({
        id: `${iso}:r7:${sevenAgo.join("-")}`,
        kind: "review-conversation",
        title: "مرور ۷ روز بعد",
        detail: `یک‌بار دیگر Conversation درس‌های ${sevenAgo.map((id) => `#${id}`).join("، ")}`,
        minutes: Math.max(8, sevenAgo.length * 2),
        speed: "1x",
      });
    }

    const listenMinutes = packed.minutes;
    const reviewMinutes = tasks
      .filter((t) => t.kind !== "new")
      .reduce((sum, t) => sum + t.minutes, 0);

    days.push({
      day: dayIndex,
      iso,
      jalali: formatJalali(date),
      weekday,
      phase: "مرحله ۱ – دور اول (۱x)",
      phaseKey: "p1",
      tasks,
      listenMinutes: Math.round(listenMinutes),
      reviewMinutes,
    });
    dayIndex += 1;
  }

  const secondQueue = [...lessons];
  let secondCursor = 0;
  while (secondCursor < secondQueue.length) {
    const date = addDays(PLAN_START, dayIndex - 1);
    const weekday = WEEKDAYS[date.getDay()];
    const iso = isoDate(date);
    const scaled = secondQueue.slice(secondCursor).map((lesson) => ({
      ...lesson,
      totalMinutes: Math.round((lesson.totalMinutes / 1.5) * 10) / 10,
    }));
    const packed = packLessons(scaled, 0, 110, 130);
    const real = secondQueue.slice(secondCursor, secondCursor + packed.picked.length);
    secondCursor += packed.picked.length;

    days.push({
      day: dayIndex,
      iso,
      jalali: formatJalali(date),
      weekday,
      phase: "مرحله ۲ – دور دوم (۱.۵x)",
      phaseKey: "p2",
      listenMinutes: Math.round(packed.minutes),
      reviewMinutes: 0,
      tasks: real.map((lesson, index) => ({
        id: `${iso}:second:${lesson.id}`,
        lessonId: lesson.id,
        kind: "second" as const,
        title: lessonLabel(lesson),
        detail: "کل محتوا را با سرعت ۱.۵x یک‌بار دیگر گوش بده؛ Conversation را برای بار آخر مرور کن.",
        minutes: packed.picked[index].totalMinutes,
        speed: "1.5x" as const,
      })),
    });
    dayIndex += 1;
  }

  const consolidate = [
    { book: "Everyday", text: "Conversationهای پوشه ۱ + خواندن همه Vocabulary/Context همین پوشه" },
    { book: "Advance 1", text: "Conversationهای پوشه ۲ + خواندن Vocabulary/Context پوشه ۲" },
    { book: "Advance 2", text: "Conversationهای پوشه ۳ + خواندن Vocabulary/Context پوشه ۳" },
  ];
  for (const item of consolidate) {
    const date = addDays(PLAN_START, dayIndex - 1);
    const iso = isoDate(date);
    days.push({
      day: dayIndex,
      iso,
      jalali: formatJalali(date),
      weekday: WEEKDAYS[date.getDay()],
      phase: "مرحله ۳ – جمع‌بندی",
      phaseKey: "p3",
      listenMinutes: 90,
      reviewMinutes: 20,
      tasks: [
        {
          id: `${iso}:cons:${item.book}`,
          kind: "consolidate",
          title: `جمع‌بندی ${item.book}`,
          detail: item.text,
          minutes: 110,
          speed: "1.5x",
        },
      ],
    });
    dayIndex += 1;
  }

  return days;
}

export const schedule = buildSchedule();

export function findDay(iso: string) {
  return schedule.find((d) => d.iso === iso) ?? null;
}

export function nearestPlanDay(iso: string) {
  return (
    schedule.find((d) => d.iso === iso) ??
    schedule.find((d) => d.iso > iso) ??
    schedule.at(-1)!
  );
}
