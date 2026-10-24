import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { priorLessonIds } from "./schedule";
import type { ProgressState } from "./types";

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "progress.json");

const owner = process.env.GITHUB_OWNER || "kianiii";
const repo = process.env.GITHUB_REPO || "zaban";
const branch = process.env.GITHUB_BRANCH || "main";
const remotePath = process.env.GITHUB_PROGRESS_PATH || "data/progress.json";
const token = process.env.GITHUB_TOKEN || "";

function emptyState(): ProgressState {
  return {
    completed: [],
    lessonFirstDone: [...priorLessonIds],
    lessonSecondDone: [],
    notes: {},
    updatedAt: new Date().toISOString(),
  };
}

function useGithub() {
  return Boolean(token);
}

function githubHeaders() {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "eteach-tracker",
  };
}

function contentsUrl() {
  return `https://api.github.com/repos/${owner}/${repo}/contents/${remotePath}`;
}

async function readGithub(): Promise<{ state: ProgressState; sha?: string }> {
  const res = await fetch(`${contentsUrl()}?ref=${branch}`, {
    headers: githubHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) return { state: emptyState() };
  if (!res.ok) {
    throw new Error(`GitHub read failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { content?: string; sha?: string };
  const decoded = Buffer.from(json.content || "", "base64").toString("utf8");
  return { state: JSON.parse(decoded) as ProgressState, sha: json.sha };
}

async function writeGithub(state: ProgressState, sha?: string) {
  const next = { ...state, updatedAt: new Date().toISOString() };
  const res = await fetch(contentsUrl(), {
    method: "PUT",
    headers: { ...githubHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "update study progress",
      content: Buffer.from(JSON.stringify(next, null, 2), "utf8").toString("base64"),
      branch,
      sha,
    }),
  });
  if (!res.ok) {
    throw new Error(`GitHub write failed: ${res.status} ${await res.text()}`);
  }
  return next;
}

function readLocal(): ProgressState {
  if (!existsSync(filePath)) return emptyState();
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as ProgressState;
  } catch {
    return emptyState();
  }
}

function writeLocal(state: ProgressState) {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  const next = { ...state, updatedAt: new Date().toISOString() };
  writeFileSync(filePath, JSON.stringify(next, null, 2), "utf8");
  return next;
}

export async function readProgress(): Promise<ProgressState> {
  if (useGithub()) {
    const { state } = await readGithub();
    return state;
  }
  return readLocal();
}

export async function writeProgress(state: ProgressState) {
  if (useGithub()) {
    const current = await readGithub();
    return writeGithub(state, current.sha);
  }
  return writeLocal(state);
}

export async function toggleTask(taskId: string, lessonId?: number, kind?: string) {
  const state = useGithub() ? (await readGithub()).state : readLocal();
  const has = state.completed.includes(taskId);
  state.completed = has
    ? state.completed.filter((id) => id !== taskId)
    : [...state.completed, taskId];

  if (lessonId && kind === "new") {
    const set = new Set(state.lessonFirstDone);
    if (has) set.delete(lessonId);
    else set.add(lessonId);
    state.lessonFirstDone = [...set].sort((a, b) => a - b);
  }
  if (lessonId && kind === "second") {
    const set = new Set(state.lessonSecondDone);
    if (has) set.delete(lessonId);
    else set.add(lessonId);
    state.lessonSecondDone = [...set].sort((a, b) => a - b);
  }
  return writeProgress(state);
}

export function storageLabel() {
  return useGithub() ? "github" : "local";
}
