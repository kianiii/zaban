import type { Pair } from "./types";

export type LessonText = {
  focus: string;
  source: string;
  sentences: Pair[];
  words: Pair[];
  proverb: Pair[];
  conversation: string[];
};

const cache = new Map<number, LessonText>();
const inflight = new Map<number, Promise<LessonText | null>>();

function basePath() {
  return process.env.NEXT_PUBLIC_BASE_PATH || "";
}

export function loadLessonText(id: number) {
  const hit = cache.get(id);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(id);
  if (pending) return pending;

  const request = fetch(`${basePath()}/content/${id}.json`)
    .then((res) => (res.ok ? (res.json() as Promise<LessonText>) : null))
    .then((data) => {
      if (data) cache.set(id, data);
      inflight.delete(id);
      return data;
    })
    .catch(() => {
      inflight.delete(id);
      return null;
    });

  inflight.set(id, request);
  return request;
}
