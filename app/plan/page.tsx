"use client";

import Link from "next/link";
import { useProgress } from "@/lib/useProgress";

export default function PlanPage() {
  const { data } = useProgress();
  return (
    <div className="page">
      <header>
        <h1 className="title">برنامه روزانه</h1>
        <p className="subtitle">
          یکشنبه ۳ آبان از پوشه ۴-Could you, Shall I شروع می‌شود و مرور پوشه‌های ۱ تا ۳ همان روز هست.
        </p>
      </header>
      {data.schedule.map((day) => {
        const done = day.tasks.filter((t) => data.progress.completed.includes(t.id)).length;
        const isToday = day.iso === data.todayIso;
        return (
          <Link
            key={day.iso}
            href={`/today?d=${day.iso}`}
            className="card p-4 block"
            style={{ outline: isToday ? "1px solid var(--teal)" : undefined }}
          >
            <div className="flex justify-between gap-3">
              <div>
                <div className="text-xs text-[var(--gold)]">
                  روز {day.day} · {day.weekday}
                </div>
                <div className="font-black text-lg">{day.jalali}</div>
                <div className="text-sm text-[var(--muted)] mt-1">{day.phase}</div>
              </div>
              <div className="text-left text-sm">
                <div>
                  {done}/{day.tasks.length}
                </div>
                <div className="text-[var(--muted)]">{day.listenMinutes + day.reviewMinutes}′</div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
