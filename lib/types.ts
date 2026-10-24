export type Pair = { fa: string; en: string };

export type Lesson = {
  id: number;
  book: string;
  chapter: string;
  title: string;
  coreMinutes: number;
  conversationMinutes: number;
  totalMinutes: number;
};

export type TaskKind =
  | "new"
  | "review-vocab"
  | "review-conversation"
  | "weekly"
  | "second"
  | "consolidate";

export type Task = {
  id: string;
  lessonId?: number;
  lessonIds?: number[];
  kind: TaskKind;
  title: string;
  detail: string;
  minutes: number;
  speed: "1x" | "1.5x" | "—";
};

export type DayPlan = {
  day: number;
  iso: string;
  jalali: string;
  weekday: string;
  phase: string;
  phaseKey: "p1" | "p2" | "p3" | "weekly";
  tasks: Task[];
  listenMinutes: number;
  reviewMinutes: number;
};

export type ProgressState = {
  completed: string[];
  lessonFirstDone: number[];
  lessonSecondDone: number[];
  notes: Record<string, string>;
  updatedAt: string;
};
