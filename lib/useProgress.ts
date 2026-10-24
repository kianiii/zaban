"use client";

import { useCallback, useEffect, useState } from "react";
import type { DayPlan, ProgressState } from "./types";
import { computeStats } from "./stats";
import { nearestPlanDay, schedule } from "./schedule";
import { todayIso } from "./jalali";
import { applyToggle, emptyProgress, loadProgress, persistProgress } from "./progress-store";

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

  const fallback: Payload = {
    progress: emptyProgress(),
    stats: computeStats(emptyProgress()),
    today: nearestPlanDay(todayIso()),
    todayIso: todayIso(),
    schedule,
    storage: "local",
  };

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

  function toggle(taskId: string, lessonId?: number, kind?: string) {
    setData((prev) => {
      const base = prev ?? fallback;
      const next = applyToggle(base.progress, taskId, lessonId, kind);
      void persistProgress(next).then((storage) => {
        setData((current) => (current ? { ...current, storage } : current));
      });
      return { ...base, progress: next, stats: computeStats(next) };
    });
  }

  return { data: data ?? fallback, loading, toggle, reload: load };
}
