import { LessonBody } from "@/components/LessonContent";
import { lessonBand } from "@/lib/cefr";
import { lessons } from "@/lib/schedule";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ id: String(lesson.id) }));
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = lessons.find((item) => item.id === Number(id));
  if (!lesson) notFound();

  return (
    <div className="page">
      <Link href="/lessons" className="text-[13px] text-[var(--gold)]">
        ← بازگشت به فهرست
      </Link>
      <header className="card p-3.5">
        <div className="text-[12px] text-[var(--gold)]">
          #{lesson.id} · {lessonBand(lesson)} · {lesson.book}
        </div>
        <h1 className="title mt-1">{lesson.chapter}</h1>
        <p className="subtitle">{lesson.title}</p>
      </header>
      <div className="card p-3.5">
        <LessonBody lessonId={lesson.id} />
      </div>
    </div>
  );
}
