"use client";

import { LessonBody } from "@/components/LessonContent";
import type { DayPlan } from "@/lib/types";

const kindLabel: Record<string, string> = {
  new: "درس جدید",
  "review-vocab": "مرور لغت",
  "review-conversation": "مرور مکالمه",
  weekly: "مرور هفته",
  second: "دور دوم",
  consolidate: "جمع‌بندی",
};

const priorChapter: Record<string, string> = {
  "1": "1-Greeting",
  "2": "2-Using look + adj",
  "3": "3-Would like",
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
        const priorKey = task.id.split(":prior:")[1];
        return (
          <article key={task.id} className="card p-3.5" style={{ opacity: done ? 0.72 : 1 }}>
            <button
              onClick={() => onToggle(task.id, task.lessonId, task.kind)}
              className="w-full text-right flex gap-3 items-start bg-transparent border-0 p-0 text-inherit"
            >
              <span
                className="mt-1 size-7 shrink-0 rounded-full border grid place-items-center text-sm"
                style={{
                  borderColor: done ? "var(--teal)" : "var(--line)",
                  background: done ? "var(--teal)" : "transparent",
                  color: done ? "#08110f" : "var(--muted)",
                }}
              >
                {done ? "✓" : ""}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] text-[var(--gold)] mb-1">
                  {kindLabel[task.kind]} · {task.speed} · {task.minutes} دقیقه
                </span>
                <span className="task-title">{task.title}</span>
                <span className="task-detail">{task.detail}</span>
              </span>
            </button>
            {task.lessonId ? <LessonBody lessonId={task.lessonId} /> : null}
            {priorKey && priorChapter[priorKey] ? <LessonBody chapter={priorChapter[priorKey]} /> : null}
          </article>
        );
      })}
    </section>
  );
}
