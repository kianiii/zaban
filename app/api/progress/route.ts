import { NextResponse } from "next/server";
import { readProgress, storageLabel, toggleTask, writeProgress } from "@/lib/db";
import { computeStats } from "@/lib/stats";
import { nearestPlanDay, schedule } from "@/lib/schedule";
import { todayIso } from "@/lib/jalali";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const progress = await readProgress();
  const iso = todayIso();
  return NextResponse.json({
    progress,
    stats: computeStats(progress),
    today: nearestPlanDay(iso),
    todayIso: iso,
    schedule,
    storage: storageLabel(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (body.action === "toggle") {
    const progress = await toggleTask(body.taskId, body.lessonId, body.kind);
    return NextResponse.json({
      progress,
      stats: computeStats(progress),
      storage: storageLabel(),
    });
  }
  if (body.action === "note") {
    const progress = await readProgress();
    progress.notes[body.taskId] = body.note ?? "";
    return NextResponse.json({
      progress: await writeProgress(progress),
      stats: computeStats(progress),
      storage: storageLabel(),
    });
  }
  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
