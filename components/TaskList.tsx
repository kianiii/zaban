"use client";

import { useState } from "react";
import { LessonPanel, LessonReader } from "@/components/LessonPanel";
import { getLesson, locate } from "@/lib/catalog";
import type { DayPlan } from "@/lib/types";

const kindLabel: Record<string, string> = {
  new: "درس جدید",
  "review-vocab": "مرور لغت",
  "review-conversation": "مرور مکالمه",
  weekly: "مرور هفته",
  second: "دور دوم",
  consolidate: "جمع‌بندی",
};

export function TaskList({
  day,
  completed,
  onToggle,
}: {
  day: DayPlan;
  completed: string[];
  onToggle: (taskId: string, lessonId?: number, kind?: string) => void;
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  const doneCount = day.tasks.filter((t) => completed.includes(t.id)).length;
  return (
    <section className="page">
      <div>
        <div className="text-[var(--gold)] text-[13px]">{day.phase}</div>
        <h2 className="title">
          {day.weekday} · {day.jalali}
        </h2>
        <p className="subtitle">
          روز {day.day} · {doneCount}/{day.tasks.length} انجام شد · گوش دادن {day.listenMinutes}′ · مرور {day.reviewMinutes}′
        </p>
      </div>
      {day.tasks.map((task) => {
        const done = completed.includes(task.id);
        const related = task.lessonIds?.length ? task.lessonIds : task.lessonId ? [task.lessonId] : [];
        const main = task.lessonId ? getLesson(task.lessonId) : null;
        const place = main ? locate(main) : null;
        return (
          <article key={task.id} className="card p-3.5">
            <div className="flex gap-3 items-start">
              <button
                type="button"
                onClick={() => onToggle(task.id, task.lessonId, task.kind)}
                aria-label={done ? "برداشتن تیک" : "انجام شد"}
                className="mt-1 size-8 shrink-0 rounded-full border grid place-items-center text-sm"
                style={{
                  borderColor: done ? "var(--teal)" : "var(--line)",
                  background: done ? "var(--teal)" : "transparent",
                  color: done ? "#fff8ec" : "var(--muted)",
                }}
              >
                {done ? "✓" : ""}
              </button>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] text-[var(--gold)]">
                  {kindLabel[task.kind]} · {task.speed} · {task.minutes} دقیقه
                  {task.carried ? ` · منتقل از ${task.originJalali}` : ""}
                </div>
                <div className="task-title">{task.title}</div>
                {place ? (
                  <div className="text-[13px] text-[var(--teal)] leading-7">
                    پوشه {place.folder} · جلسه {place.session} · ویس {place.voice}
                  </div>
                ) : null}
                <div className="task-detail">{task.detail}</div>
                {done ? (
                  <button
                    type="button"
                    onClick={() => onToggle(task.id, task.lessonId, task.kind)}
                    className="mt-2 rounded-lg bg-[var(--paper)] px-3 py-1.5 text-[13px] font-bold border border-[var(--line)]"
                  >
                    برداشتن تیک
                  </button>
                ) : null}
                {related.map((id) => (
                  <LessonPanel key={id} lessonId={id} onOpen={setOpenId} />
                ))}
              </div>
            </div>
          </article>
        );
      })}
      {openId ? <LessonReader lessonId={openId} onClose={() => setOpenId(null)} /> : null}
    </section>
  );
}
