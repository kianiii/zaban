"use client";

import type { DayScore, PeriodScore } from "@/lib/period";

function Bar({ day, max }: { day: DayScore; max: number }) {
  const height = max ? Math.max(6, Math.round((day.done / max) * 92)) : 6;
  return (
    <div className="flex flex-col items-center gap-1 min-w-[28px] flex-1">
      <div className="text-[11px] text-[var(--muted)]">{day.done}</div>
      <div className="h-[96px] w-full flex items-end justify-center">
        <div
          className="w-[70%] max-w-[18px] rounded-t-md"
          style={{
            height,
            background: day.percent === 100 && day.planned ? "var(--teal)" : "var(--gold)",
          }}
        />
      </div>
      <div className="text-[11px] font-bold">{day.weekday.slice(0, 1) || day.jalali.split(" ")[0]}</div>
    </div>
  );
}

export function PeriodBoard({ score }: { score: PeriodScore }) {
  const max = Math.max(...score.days.map((day) => day.done), 1);
  return (
    <section className="card p-3.5">
      <h2 className="m-0 text-[1.1rem] font-black">{score.title}</h2>
      <p className="subtitle">{score.range}</p>
      <div className="grid grid-cols-2 gap-2 mt-3">
        {[
          ["انجام‌شده", `${score.done}/${score.planned}`],
          ["درصد پیشرفت", `${score.percent}%`],
          ["دقیقه گوش‌دادن", `${Math.round(score.doneMinutes)}/${Math.round(score.plannedMinutes)}`],
          ["درس جدید همین دوره", String(score.newLessons)],
          ["روز کامل", String(score.completeDays)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-[var(--paper)] px-3 py-2">
            <div className="text-[12px] text-[var(--muted)]">{label}</div>
            <div className="font-black text-[1.1rem]">{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto">
        <div className="flex items-end gap-1 min-w-[260px]">
          {score.days.map((day) => (
            <Bar key={day.iso} day={day} max={max} />
          ))}
        </div>
      </div>
      <p className="subtitle">هر ستون تعداد تسک انجام‌شده همان روز است. سبز یعنی آن روز کامل شده.</p>
    </section>
  );
}
