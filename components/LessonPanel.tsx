"use client";

import { useEffect, useState } from "react";
import { getLesson, lessonMeta, locate } from "@/lib/catalog";
import { loadLessonText, type LessonText } from "@/lib/content";
import type { Pair } from "@/lib/types";

function PairList({ items }: { items: Pair[] }) {
  if (!items.length) return <p className="subtitle">موردی ثبت نشده.</p>;
  return (
    <ol className="m-0 mt-3 grid gap-3 p-0 list-none">
      {items.map((item, index) => (
        <li key={`${item.en}-${index}`} className="memory-card">
          <div className="text-[12px] text-[var(--gold)] mb-1">{index + 1}</div>
          <div className="en-line font-extrabold">{item.en}</div>
          {item.fa ? <div className="fa-line mt-2">{item.fa}</div> : null}
        </li>
      ))}
    </ol>
  );
}

export function LessonReader({
  lessonId,
  onClose,
}: {
  lessonId: number;
  onClose?: () => void;
}) {
  const lesson = getLesson(lessonId);
  const [text, setText] = useState<LessonText | null>(null);

  useEffect(() => {
    let live = true;
    loadLessonText(lessonId).then((data) => {
      if (live) setText(data);
    });
    return () => {
      live = false;
    };
  }, [lessonId]);

  useEffect(() => {
    if (!onClose) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!lesson) return null;
  const place = locate(lesson);

  return (
    <div className={onClose ? "reader" : "min-h-[100dvh] w-full bg-[var(--paper)] px-1"}>
      <div className="reader-inner">
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="mb-4 rounded-xl bg-[var(--teal)] text-[var(--paper)] font-black px-4 py-3 border-0"
          >
            بستن صفحه درس
          </button>
        ) : null}
        <p className="text-[13px] text-[var(--gold)] m-0">
          پوشه {place.folder} · جلسه {place.session}
        </p>
        <h1 className="title mt-2">ویس: {place.voice}</h1>
        <p className="subtitle">{place.path}</p>
        {text ? (
          <>
            <p className="subtitle">منبع: {text.source}</p>
            <h2 className="m-0 mt-6 text-[1.1rem] font-black text-[var(--gold)]">
              جمله‌ها ({text.sentences.length})
            </h2>
            <PairList items={text.sentences} />
            <h2 className="m-0 mt-8 text-[1.1rem] font-black text-[var(--gold)]">لغت‌ها ({text.words.length})</h2>
            <PairList items={text.words} />
            {text.proverb.length ? (
              <>
                <h2 className="m-0 mt-8 text-[1.1rem] font-black text-[var(--gold)]">ضرب‌المثل</h2>
                <PairList items={text.proverb} />
              </>
            ) : null}
            {text.conversation.length ? (
              <>
                <h2 className="m-0 mt-8 text-[1.1rem] font-black text-[var(--gold)]">متن مکالمه</h2>
                <ol className="m-0 mt-3 grid gap-3 p-0 list-none">
                  {text.conversation.map((line, index) => (
                    <li key={`${line}-${index}`} className="memory-card">
                      <div className="en-line">{line}</div>
                    </li>
                  ))}
                </ol>
              </>
            ) : null}
          </>
        ) : (
          <p className="subtitle">در حال باز کردن متن کامل...</p>
        )}
      </div>
    </div>
  );
}

export function LessonPanel({ lessonId, onOpen }: { lessonId: number; onOpen: (id: number) => void }) {
  const lesson = getLesson(lessonId);
  const meta = lessonMeta(lessonId);
  if (!lesson) return null;
  const place = locate(lesson);

  return (
    <button
      type="button"
      onClick={() => onOpen(lessonId)}
      className="mt-3 w-full text-right rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-3 py-3"
    >
      <div className="text-[12px] text-[var(--gold)]">
        پوشه {place.folder} · جلسه {place.session}
      </div>
      <div className="font-extrabold leading-7 mt-0.5">ویس: {place.voice}</div>
      <div className="text-[13px] text-[var(--teal)]">
        {meta ? `${meta.sentences} جمله · ${meta.words} لغت` : "متن درس"} · باز کردن صفحه کامل
      </div>
    </button>
  );
}
