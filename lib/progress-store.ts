import { priorLessonIds } from "./schedule";
import type { ProgressState } from "./types";

const OWNER = "kianiii";
const REPO = "zaban";
const PATH = "data/progress.json";
const TOKEN_KEY = "eteach_github_token";
const LOCAL_KEY = "eteach_progress";

export function emptyProgress(): ProgressState {
  return {
    completed: [],
    lessonFirstDone: [...priorLessonIds],
    lessonSecondDone: [],
    notes: {},
    updatedAt: new Date().toISOString(),
  };
}

export function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token: string) {
  if (!token) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token.trim());
}

function applyToggle(state: ProgressState, taskId: string, lessonId?: number, kind?: string) {
  const next = structuredClone(state);
  const has = next.completed.includes(taskId);
  next.completed = has ? next.completed.filter((id) => id !== taskId) : [...next.completed, taskId];
  if (lessonId && kind === "new") {
    const set = new Set(next.lessonFirstDone);
    if (has) set.delete(lessonId);
    else set.add(lessonId);
    next.lessonFirstDone = [...set].sort((a, b) => a - b);
  }
  if (lessonId && kind === "second") {
    const set = new Set(next.lessonSecondDone);
    if (has) set.delete(lessonId);
    else set.add(lessonId);
    next.lessonSecondDone = [...set].sort((a, b) => a - b);
  }
  next.updatedAt = new Date().toISOString();
  return next;
}

async function readGithub(): Promise<{ state: ProgressState; sha?: string }> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}?ref=main`,
    { cache: "no-store", headers: { Accept: "application/vnd.github+json" } }
  );
  if (!res.ok) throw new Error("github read failed");
  const json = (await res.json()) as { content?: string; sha?: string };
  const decoded = atob(json.content || "");
  return { state: JSON.parse(decoded) as ProgressState, sha: json.sha };
}

async function writeGithub(state: ProgressState, sha?: string) {
  const token = getToken();
  if (!token) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
    return state;
  }
  const current = sha ? { sha } : await readGithub();
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "update study progress",
      content: btoa(unescape(encodeURIComponent(JSON.stringify(state, null, 2)))),
      branch: "main",
      sha: current.sha,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  return state;
}

export async function loadProgress(): Promise<{ state: ProgressState; storage: "github" | "local" }> {
  try {
    const { state } = await readGithub();
    return { state, storage: "github" };
  } catch {
    const raw = localStorage.getItem(LOCAL_KEY);
    return { state: raw ? (JSON.parse(raw) as ProgressState) : emptyProgress(), storage: "local" };
  }
}

export async function toggleProgress(taskId: string, lessonId?: number, kind?: string) {
  const current = await loadProgress();
  const next = applyToggle(current.state, taskId, lessonId, kind);
  try {
    await writeGithub(next);
    return { state: next, storage: getToken() ? ("github" as const) : current.storage };
  } catch {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    return { state: next, storage: "local" as const };
  }
}
