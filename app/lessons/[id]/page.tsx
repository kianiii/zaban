import { LessonReader } from "@/components/LessonPanel";
import { getLesson, lessons } from "@/lib/catalog";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return lessons.map((lesson) => ({ id: String(lesson.id) }));
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLesson(Number(id));
  if (!lesson) notFound();
  return <LessonReader lessonId={lesson.id} />;
}
