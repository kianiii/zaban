"use client";

import { lessonContent } from "@/lib/learnables";
import { lessonBand } from "@/lib/cefr";
import { lessons } from "@/lib/schedule";
import { useProgress } from "@/lib/useProgress";
import Link from "next/link";

export default function LessonsPage() {
  const { data } = useProgress();
  const first = new Set(data.progress.lessonFirstDone);
  const second = new Set(data.progress.lessonSecondDone);

  return (
    <div className="page">
      <header>
        <h1 className="title">فهرست درس‌ها</h1>
        <p className="subtitle">
          پوشه‌های ۱ تا ۳ Everyday گوش داده شده‌اند. درس جدید از پوشه ۴ است. متن هر درس از کتاب‌های میرزایی مقدماتی، پیشرفته ۱ و پیشرفته ۲ آمده.
        </p>
      </header>
      {lessons.map((lesson) => {
        const content = lessonContent(lesson.id);
        return (
          <Link key={lesson.id} href={`/lessons/${lesson.id}`} className="card p-3.5 block">
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[12px] text-[var(--gold)]">
                  #{lesson.id} · {lessonBand(lesson)} · {lesson.book}
                </div>
                <div className="font-black mt-1 leading-7">{lesson.chapter}</div>
                <div className="text-[13px] text-[var(--muted)] leading-7 break-words">{lesson.title}</div>
                {content ? (
                  <div className="text-[13px] mt-2 text-[var(--teal)]">
                    {content.sentences.length} جمله · {content.words.length} لغت
                  </div>
                ) : null}
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
          </Link>
        );
      })}
    </div>
  );
}
