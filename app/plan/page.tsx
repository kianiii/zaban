"use client";

import Link from "next/link";
import { carriedCount } from "@/lib/rollover";
import { useProgress } from "@/lib/useProgress";

export default function PlanPage() {
  const { data } = useProgress();
  return (
    <div className="page">
      <header>
        <h1 className="title">برنامه روزانه</h1>
        <p className="subtitle">
          اگر درسی را همان روز نخوانی، با تاریخ اصلی به روز بعد منتقل می‌شود و ترتیب درس‌ها عوض نمی‌شود.
        </p>
      </header>
      {data.schedule.map((day) => {
        const done = day.tasks.filter((t) => data.progress.completed.includes(t.id)).length;
        const isToday = day.iso === data.todayIso;
        const moved = isToday ? carriedCount(data.schedule, data.progress.completed, day.iso) : 0;
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
                {moved ? <div className="text-sm text-[var(--fa)] mt-1">{moved} مورد از روزهای قبل</div> : null}
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
