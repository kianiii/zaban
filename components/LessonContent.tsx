import type { ReactNode } from "react";
import { chapterContent, lessonContent, type LessonContent as Content, type Pair } from "@/lib/learnables";

function PairList({ items, empty }: { items: Pair[]; empty: string }) {
  if (!items.length) return <p className="subtitle">{empty}</p>;
  return (
    <ul className="m-0 mt-2 grid gap-2 p-0 list-none">
      {items.map((item, index) => (
        <li key={`${item.en}-${index}`} className="rounded-xl bg-black/20 px-3 py-2.5">
          <div className="font-extrabold leading-7">{item.en}</div>
          {item.fa ? <div className="text-[var(--muted)] text-[15px] leading-7">{item.fa}</div> : null}
        </li>
      ))}
    </ul>
  );
}

function Block({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <section className="mt-3">
      <h3 className="m-0 text-[0.95rem] font-black text-[var(--gold)]">
        {title} <span className="text-[var(--muted)] font-bold">({count})</span>
      </h3>
      {children}
    </section>
  );
}

export function LessonBody({
  lessonId,
  chapter,
}: {
  lessonId?: number;
  chapter?: string;
}) {
  const content: Content | null = lessonId
    ? lessonContent(lessonId)
    : chapter
      ? chapterContent(chapter)
      : null;
  if (!content) return null;

  return (
    <div className="mt-3 text-right">
      <p className="text-[13px] text-[var(--gold)] m-0">{content.focus}</p>
      <p className="text-[12px] text-[var(--muted)] m-0 mt-1">منبع: {content.source}</p>
      <Block title="جمله‌ها با معنی فارسی" count={content.sentences.length}>
        <PairList items={content.sentences} empty="جمله‌ای برای این بخش ثبت نشده." />
      </Block>
      <Block title="لغت‌های این درس" count={content.words.length}>
        <PairList items={content.words} empty="لغتی جدا برای این بخش ثبت نشده." />
      </Block>
      {content.proverb.length ? (
        <Block title="ضرب‌المثل" count={content.proverb.length}>
          <PairList items={content.proverb} empty="" />
        </Block>
      ) : null}
      {content.conversation.length ? (
        <Block title="متن مکالمه" count={content.conversation.length}>
          <ul className="m-0 mt-2 grid gap-1.5 p-0 list-none">
            {content.conversation.map((line, index) => (
              <li key={`${line}-${index}`} className="text-[15px] leading-7">
                {line}
              </li>
            ))}
          </ul>
        </Block>
      ) : null}
    </div>
  );
}
