"use client";

import { useCallback, useEffect, useState } from "react";
import type { DayPlan, ProgressState } from "./types";
import { computeStats } from "./stats";
import { nearestPlanDay, schedule } from "./schedule";
import { todayIso } from "./jalali";
import { emptyProgress, loadProgress, toggleProgress } from "./progress-store";

type Payload = {
  progress: ProgressState;
  stats: ReturnType<typeof computeStats>;
  today: DayPlan;
  todayIso: string;
  schedule: DayPlan[];
  storage: "github" | "local";
};

export function useProgress() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { state, storage } = await loadProgress();
    const iso = todayIso();
    setData({
      progress: state,
      stats: computeStats(state),
      today: nearestPlanDay(iso),
      todayIso: iso,
      schedule,
      storage,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(taskId: string, lessonId?: number, kind?: string) {
    const { state, storage } = await toggleProgress(taskId, lessonId, kind);
    setData((prev) =>
      prev
        ? { ...prev, progress: state, stats: computeStats(state), storage }
        : prev
    );
  }

  const fallback: Payload = {
    progress: emptyProgress(),
    stats: computeStats(emptyProgress()),
    today: nearestPlanDay(todayIso()),
    todayIso: todayIso(),
    schedule,
    storage: "local",
  };

  return { data: data ?? fallback, loading, toggle, reload: load };
}
