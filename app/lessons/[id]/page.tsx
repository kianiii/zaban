import { LessonPanel } from "@/components/LessonPanel";
import { getLesson, lessons, locate } from "@/lib/catalog";
import { lessonBand } from "@/lib/cefr";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ id: String(lesson.id) }));
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLesson(Number(id));
  if (!lesson) notFound();
  const place = locate(lesson);

  return (
    <div className="page">
      <Link href="/lessons" className="text-[13px] text-[var(--gold)]">
        بازگشت به فهرست
      </Link>
      <header className="card p-3.5">
        <div className="text-[12px] text-[var(--gold)]">
          پوشه {place.folder} · {lessonBand(lesson)} · {place.book}
        </div>
        <h1 className="title mt-1">{place.session}</h1>
        <p className="subtitle">ویس: {place.voice}</p>
      </header>
      <div className="card p-3.5">
        <LessonPanel lessonId={lesson.id} defaultOpen />
      </div>
    </div>
  );
}
