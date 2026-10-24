"use client";

import { TokenBox } from "@/components/TokenBox";
import { useProgress } from "@/lib/useProgress";
import Link from "next/link";

function Ring({ value, label }: { value: number; label: string }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="card p-3.5 flex items-center gap-3">
      <svg width="88" height="88" viewBox="0 0 96 96" className="shrink-0">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(28,36,48,.12)" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="#1b6b56"
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
        />
        <text x="48" y="53" textAnchor="middle" fill="#1c2430" fontSize="16" fontWeight="800">
          {value}%
        </text>
      </svg>
      <div className="min-w-0">
        <div className="text-[var(--muted)] text-[13px]">{label}</div>
        <div className="font-black text-[1.05rem] mt-0.5 leading-7">پیشرفت ثبت‌شده</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading } = useProgress();
  const { stats, today } = data;

  return (
    <div className="page">
      <header>
        <p className="text-[var(--gold)] text-[13px] m-0">یکشنبه ۳ آبان · شروع از پوشه درس ۴ + مرور ۱ تا ۳</p>
        <h1 className="title mt-1">پیشرفت زبان</h1>
        <p className="subtitle">
          {loading ? "در حال خواندن دیتابیس..." : "از گوشی یا کامپیوتر تیک بزن؛ پیشرفت ذخیره می‌شود."}
        </p>
      </header>

      <div className="grid gap-3">
        <Ring value={stats.a2Percent} label="پوشش سطح A2" />
        <Ring value={stats.firstPercent} label="دور اول کل دوره" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          ["درس تمام‌شده", `${stats.firstDone}/${stats.totalLessons}`],
          ["دقیقه گوش‌داده‌شده", String(Math.round(stats.doneMinutes))],
          ["روزهای کامل", `${stats.completedDays}/${stats.planDays}`],
          ["دور دوم", String(stats.secondDone)],
        ].map(([k, v]) => (
          <div key={k} className="card p-3.5">
            <div className="text-[var(--muted)] text-[12px] leading-6">{k}</div>
            <div className="text-[1.25rem] font-black mt-1">{v}</div>
          </div>
        ))}
      </div>

      <section className="card p-3.5">
        <h2 className="m-0 text-[1.05rem] font-black">نردبان CEFR</h2>
        <p className="text-[13px] text-[var(--muted)] mt-1 mb-3 leading-7">
          Everyday بیشتر A2 است. Advance 1 مرز A2+ و Advance 2 شروع B1.
        </p>
        <div className="space-y-3">
          {stats.bands.map((band) => (
            <div key={band.band}>
              <div className="flex justify-between text-[13px] mb-1">
                <span>{band.band}</span>
                <span>
                  {band.done}/{band.total}
                </span>
              </div>
              <div className="h-2 rounded-full bg-black/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${band.percent}%`,
                    background: band.band.startsWith("A2") ? "var(--teal)" : "var(--gold)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-3.5">
        <h2 className="m-0 text-[1.05rem] font-black">پوشه‌ها</h2>
        <div className="mt-3 grid gap-3">
          {stats.books.map((book) => (
            <div key={book.key}>
              <div className="flex justify-between text-[13px] mb-1 gap-2">
                <span>{book.label}</span>
                <span>{book.percent}%</span>
              </div>
              <div className="h-2 rounded-full bg-black/5 overflow-hidden">
                <div className="h-full bg-[var(--gold)]" style={{ width: `${book.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <TokenBox />

      <Link href="/today" className="card p-3.5 block">
        <div className="text-[var(--gold)] text-[13px]">برنامه امروز</div>
        <div className="font-black text-[1.1rem] mt-1 leading-7">
          {today.weekday} · {today.jalali}
        </div>
        <div className="text-[var(--muted)] text-[13px] mt-1">{today.phase}</div>
      </Link>
    </div>
  );
}
