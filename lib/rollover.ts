import type { DayPlan, ProgressState, Task } from "./types";

export function dayWithRollover(days: DayPlan[], completed: string[], viewIso: string): DayPlan {
  const view = days.find((day) => day.iso === viewIso) ?? days.find((day) => day.iso > viewIso) ?? days.at(-1)!;
  const rolled: Task[] = [];
  for (const day of days) {
    if (day.iso >= view.iso) break;
    for (const task of day.tasks) {
      if (completed.includes(task.id)) continue;
      rolled.push({
        ...task,
        carried: true,
        originIso: day.iso,
        originJalali: day.jalali,
      });
    }
  }
  const own = view.tasks.map((task) => ({
    ...task,
    originIso: view.iso,
    originJalali: view.jalali,
  }));
  return {
    ...view,
    tasks: [...rolled, ...own],
    phase: rolled.length ? `${view.phase} · ${rolled.length} مورد منتقل‌شده از روز قبل` : view.phase,
  };
}

export function carriedCount(days: DayPlan[], completed: ProgressState["completed"], viewIso: string) {
  return dayWithRollover(days, completed, viewIso).tasks.filter((task) => task.carried).length;
}
