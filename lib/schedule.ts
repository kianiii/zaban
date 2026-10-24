import { getLesson, lessons, locate } from "./catalog";
import type { DayPlan, Lesson, Task } from "./types";
import { addDays, formatJalali, isoDate, WEEKDAYS } from "./jalali";

export { lessons };
export const PLAN_START = new Date(2026, 9, 25);

export function isPriorLesson(lesson: Lesson) {
  return lesson.book.includes("Everyday") && /^[123]-/.test(lesson.chapter);
}

export const priorLessons = lessons.filter(isPriorLesson);
export const remainingLessons = lessons.filter((lesson) => !isPriorLesson(lesson));
export const priorLessonIds = priorLessons.map((lesson) => lesson.id);

function lessonLabel(lesson: Lesson) {
  const place = locate(lesson);
  return `پوشه ${place.folder} · ویس ${place.voice}`;
}

function packLessons(queue: Lesson[], start: number, target: number, hardCap: number) {
  const picked: Lesson[] = [];
  let minutes = 0;
  let i = start;
  while (i < queue.length) {
    const item = queue[i];
    if (picked.length > 0 && minutes >= target && minutes + item.totalMinutes > hardCap) break;
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
  for (const lesson of priorLessons) {
    if (lesson.chapter.startsWith("1-")) map[lesson.id] = -6;
    else if (lesson.chapter.startsWith("2-")) map[lesson.id] = -2;
    else map[lesson.id] = 0;
  }
  return map;
}

function idsLabel(ids: number[]) {
  const chapters = [...new Set(ids.map((id) => getLesson(id)?.chapter).filter(Boolean))];
  return `${chapters.join("، ")} · ${ids.map((id) => `#${id}`).join("، ")}`;
}

export function buildSchedule(): DayPlan[] {
  const remaining = remainingLessons;
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
    const isLaterSunday = date.getDay() === 0 && dayIndex > 1;

    if (isLaterSunday) {
      const weekLessons = Object.entries(firstListenDay)
        .filter(([, d]) => d >= dayIndex - 7 && d < dayIndex)
        .map(([id]) => getLesson(Number(id))!)
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
            lessonIds: weekLessons.map((lesson) => lesson.id),
            detail: weekLessons.length
              ? `Conversation و لغات ${idsLabel(weekLessons.map((l) => l.id))}`
              : "مرور درس‌های همین هفته",
            minutes,
            speed: "—",
          },
        ],
      });
      dayIndex += 1;
      continue;
    }

    const packed = packLessons(remaining, cursor, dayIndex === 1 ? 85 : 100, 125);
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

    if (dayIndex === 1) {
      const groups = [
        { key: "1", title: "مرور پوشه ۱-Greeting", ids: priorLessons.filter((l) => l.chapter.startsWith("1-")).map((l) => l.id) },
        { key: "2", title: "مرور پوشه ۲-Using look + adj", ids: priorLessons.filter((l) => l.chapter.startsWith("2-")).map((l) => l.id) },
        { key: "3", title: "مرور پوشه ۳-Would like", ids: priorLessons.filter((l) => l.chapter.startsWith("3-")).map((l) => l.id) },
      ];
      for (const group of groups) {
        tasks.push({
          id: `${iso}:prior:${group.key}`,
          kind: "review-conversation",
          title: group.title,
          lessonIds: group.ids,
          detail: `چون این فصل‌ها را گوش داده‌ای: Conversation + Vocabulary/Context ${group.ids.map((id) => `#${id}`).join("، ")}`,
          minutes: 15,
          speed: "1x",
        });
      }
    }

    const yesterday = Object.entries(firstListenDay).filter(([, d]) => d === dayIndex - 1).map(([id]) => Number(id));
    const threeAgo = Object.entries(firstListenDay).filter(([, d]) => d === dayIndex - 3).map(([id]) => Number(id));
    const sevenAgo = Object.entries(firstListenDay).filter(([, d]) => d === dayIndex - 7).map(([id]) => Number(id));

    if (yesterday.length && dayIndex > 1) {
      tasks.push({
        id: `${iso}:rv:${yesterday.join("-")}`,
        kind: "review-vocab",
        title: "مرور ۱ روز بعد",
        lessonIds: yesterday,
        detail: `خواندن Vocabulary + Context ${idsLabel(yesterday)}`,
        minutes: yesterday.length * 3,
        speed: "—",
      });
    }
    if (threeAgo.length && dayIndex > 1) {
      tasks.push({
        id: `${iso}:r3:${threeAgo.join("-")}`,
        kind: "review-conversation",
        title: "مرور ۳ روز بعد",
        lessonIds: threeAgo,
        detail: `گوش دادن دوباره Conversation ${idsLabel(threeAgo)}`,
        minutes: Math.max(8, threeAgo.length * 2),
        speed: "1x",
      });
    }
    if (sevenAgo.length && dayIndex > 1) {
      tasks.push({
        id: `${iso}:r7:${sevenAgo.join("-")}`,
        kind: "review-conversation",
        title: "مرور ۷ روز بعد",
        lessonIds: sevenAgo,
        detail: `یک‌بار دیگر Conversation ${idsLabel(sevenAgo)}`,
        minutes: Math.max(8, sevenAgo.length * 2),
        speed: "1x",
      });
    }

    days.push({
      day: dayIndex,
      iso,
      jalali: formatJalali(date),
      weekday,
      phase: dayIndex === 1 ? "یکشنبه · شروع از درس ۴ + مرور قبلی" : "مرحله ۱ – دور اول (۱x)",
      phaseKey: "p1",
      tasks,
      listenMinutes: Math.round(packed.minutes),
      reviewMinutes: tasks.filter((t) => t.kind !== "new").reduce((sum, t) => sum + t.minutes, 0),
    });
    dayIndex += 1;
  }

  const secondQueue = [...lessons];
  let secondCursor = 0;
  while (secondCursor < secondQueue.length) {
    const date = addDays(PLAN_START, dayIndex - 1);
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
      weekday: WEEKDAYS[date.getDay()],
      phase: "مرحله ۲ – دور دوم (۱.۵x)",
      phaseKey: "p2",
      listenMinutes: Math.round(packed.minutes),
      reviewMinutes: 0,
      tasks: real.map((lesson, index) => ({
        id: `${iso}:second:${lesson.id}`,
        lessonId: lesson.id,
        kind: "second" as const,
        title: lessonLabel(lesson),
        detail: "کل محتوا را با سرعت ۱.۵x یک‌بار دیگر گوش بده.",
        minutes: packed.picked[index].totalMinutes,
        speed: "1.5x" as const,
      })),
    });
    dayIndex += 1;
  }

  const consolidate = [
    { book: "Everyday", text: "Conversationهای پوشه ۱ + Vocabulary/Context" },
    { book: "Advance 1", text: "Conversationهای پوشه ۲ + Vocabulary/Context" },
    { book: "Advance 2", text: "Conversationهای پوشه ۳ + Vocabulary/Context" },
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
  return schedule.find((d) => d.iso === iso) ?? schedule.find((d) => d.iso > iso) ?? schedule.at(-1)!;
}
