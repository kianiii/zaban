"use client";

import { useCallback, useEffect, useState } from "react";
import type { DayPlan, ProgressState } from "./types";
import { computeStats } from "./stats";
import { nearestPlanDay, schedule } from "./schedule";
import { todayIso } from "./jalali";

type Payload = {
  progress: ProgressState;
  stats: ReturnType<typeof computeStats>;
  today: DayPlan;
  todayIso: string;
  schedule: DayPlan[];
};

export function useProgress() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/progress", { cache: "no-store" });
    const json = (await res.json()) as Payload;
    setData(json);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(taskId: string, lessonId?: number, kind?: string) {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", taskId, lessonId, kind }),
    });
    const json = await res.json();
    setData((prev) =>
      prev
        ? { ...prev, progress: json.progress, stats: json.stats }
        : prev
    );
  }

  const fallback: Payload = {
    progress: {
      completed: [],
      lessonFirstDone: [],
      lessonSecondDone: [],
      notes: {},
      updatedAt: "",
    },
    stats: computeStats({
      completed: [],
      lessonFirstDone: Array.from({ length: 15 }, (_, i) => i + 1),
      lessonSecondDone: [],
      notes: {},
      updatedAt: "",
    }),
    today: nearestPlanDay(todayIso()),
    todayIso: todayIso(),
    schedule,
  };

  return { data: data ?? fallback, loading, toggle, reload: load };
}
