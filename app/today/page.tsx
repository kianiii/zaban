"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TaskList } from "@/components/TaskList";
import { useProgress } from "@/lib/useProgress";
import { findDay, nearestPlanDay } from "@/lib/schedule";
import { dayWithRollover } from "@/lib/rollover";

function TodayInner() {
  const { data, toggle } = useProgress();
  const params = useSearchParams();
  const selected = params.get("d");
  const base = (selected && findDay(selected)) || nearestPlanDay(data.todayIso);
  const day = dayWithRollover(data.schedule, data.progress.completed, base.iso);
  return <TaskList day={day} completed={data.progress.completed} onToggle={toggle} />;
}

export default function TodayPage() {
  return (
    <Suspense fallback={<div className="text-[var(--muted)]">در حال بارگذاری برنامه امروز...</div>}>
      <TodayInner />
    </Suspense>
  );
}
