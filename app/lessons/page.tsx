"use client";

import { LessonPanel, LessonReader } from "@/components/LessonPanel";
import { lessonMeta, lessons, locate } from "@/lib/catalog";
import { lessonBand } from "@/lib/cefr";
import { useProgress } from "@/lib/useProgress";
import { useState } from "react";

export default function LessonsPage() {
  const { data } = useProgress();
  const first = new Set(data.progress.lessonFirstDone);
  const second = new Set(data.progress.lessonSecondDone);
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="page">
      <header>
        <h1 className="title">فهرست درس‌ها</h1>
        <p className="subtitle">روی درس بزن تا صفحه کامل جمله‌ها و لغت‌ها باز شود. پوشه و ویس مشخص است.</p>
      </header>
      {lessons.map((lesson) => {
        const place = locate(lesson);
        const meta = lessonMeta(lesson.id);
        return (
          <article key={lesson.id} className="card p-3.5">
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[12px] text-[var(--gold)]">
                  پوشه {place.folder} · {lessonBand(lesson)} · {place.book}
                </div>
                <div className="font-black mt-1 leading-7">{place.session}</div>
                <div className="text-[15px] leading-7">ویس: {place.voice}</div>
                <div className="text-[13px] mt-1 text-[var(--teal)]">
                  {meta ? `${meta.sentences} جمله · ${meta.words} لغت` : ""}
                </div>
              </div>
              <div className="text-left text-xs leading-6">
                <div>{lesson.totalMinutes}′</div>
                <div style={{ color: first.has(lesson.id) ? "var(--teal)" : "var(--muted)" }}>
                  دور ۱ {first.has(lesson.id) ? "شد" : "نه"}
                </div>
                <div style={{ color: second.has(lesson.id) ? "var(--gold)" : "var(--muted)" }}>
                  دور ۲ {second.has(lesson.id) ? "شد" : "نه"}
                </div>
              </div>
            </div>
            <LessonPanel lessonId={lesson.id} onOpen={setOpenId} />
          </article>
        );
      })}
      {openId ? <LessonReader lessonId={openId} onClose={() => setOpenId(null)} /> : null}
    </div>
  );
}
