"use client";

import { useEffect, useState } from "react";
import { getLesson, lessonMeta, locate } from "@/lib/catalog";
import { loadLessonText, type LessonText } from "@/lib/content";
import type { Pair } from "@/lib/types";

function PairList({ items }: { items: Pair[] }) {
  if (!items.length) return <p className="subtitle">موردی ثبت نشده.</p>;
  return (
    <ul className="m-0 mt-2 grid gap-2 p-0 list-none">
      {items.map((item, index) => (
        <li key={`${item.en}-${index}`} className="rounded-xl bg-black/20 px-3 py-2.5">
          <div className="en-line font-extrabold leading-7">{item.en}</div>
          {item.fa ? <div className="fa-line text-[var(--muted)] text-[15px] leading-7 mt-1">{item.fa}</div> : null}
        </li>
      ))}
    </ul>
  );
}

export function LessonPanel({ lessonId, defaultOpen = false }: { lessonId: number; defaultOpen?: boolean }) {
  const lesson = getLesson(lessonId);
  const meta = lessonMeta(lessonId);
  const [open, setOpen] = useState(defaultOpen);
  const [text, setText] = useState<LessonText | null>(null);

  useEffect(() => {
    if (!open) return;
    let live = true;
    loadLessonText(lessonId).then((data) => {
      if (live) setText(data);
    });
    return () => {
      live = false;
    };
  }, [open, lessonId]);

  if (!lesson) return null;
  const place = locate(lesson);

  return (
    <div className="mt-3 rounded-2xl border border-white/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-full text-right bg-black/15 px-3 py-2.5 border-0 text-inherit"
      >
        <div className="text-[12px] text-[var(--gold)]">
          پوشه {place.folder} · جلسه {place.session}
        </div>
        <div className="font-extrabold leading-7 mt-0.5">ویس: {place.voice}</div>
        <div className="text-[13px] text-[var(--muted)]">
          {meta ? `${meta.sentences} جمله · ${meta.words} لغت` : "متن درس"} · {open ? "بستن" : "باز کردن"}
        </div>
      </button>
      {open ? (
        <div className="px-3 pb-3">
          {text ? (
            <>
              <p className="text-[12px] text-[var(--muted)] mt-2 mb-0">منبع: {text.source}</p>
              <h3 className="m-0 mt-3 text-[0.95rem] font-black text-[var(--gold)]">
                جمله‌ها ({text.sentences.length})
              </h3>
              <PairList items={text.sentences} />
              <h3 className="m-0 mt-4 text-[0.95rem] font-black text-[var(--gold)]">لغت‌ها ({text.words.length})</h3>
              <PairList items={text.words} />
              {text.proverb.length ? (
                <>
                  <h3 className="m-0 mt-4 text-[0.95rem] font-black text-[var(--gold)]">ضرب‌المثل</h3>
                  <PairList items={text.proverb} />
                </>
              ) : null}
              {text.conversation.length ? (
                <>
                  <h3 className="m-0 mt-4 text-[0.95rem] font-black text-[var(--gold)]">متن مکالمه</h3>
                  <ul className="m-0 mt-2 grid gap-1.5 p-0 list-none">
                    {text.conversation.map((line, index) => (
                      <li key={`${line}-${index}`} className="en-line text-[15px] leading-7">
                        {line}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          ) : (
            <p className="subtitle">در حال باز کردن متن...</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
