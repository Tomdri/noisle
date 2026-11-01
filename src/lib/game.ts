import { SOUNDS, OPTIONS, type Sound, type Category } from "../data/sounds";

/** How much of the clip (seconds) is unlocked at each attempt. */
export const CLIP_LENGTHS = [0.5, 1, 2, 4, 8, 16];
export const MAX_TRIES = CLIP_LENGTHS.length;

/** Day #1 of Noisle. */
const LAUNCH = new Date(2026, 10, 1); // 1 Nov 2026, local time

/** Puzzle number for a date, counted in the player's local calendar days. */
export function puzzleNumber(date = new Date()): number {
  const day = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((day(date) - day(LAUNCH)) / 86_400_000) + 1;
}

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Shuffled once with a fixed seed so every player gets the same order. */
const ORDER: Sound[] = (() => {
  const arr = [...SOUNDS];
  const r = mulberry32(0x6e6f6973); // "nois"
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
})();

export function soundForPuzzle(n: number): Sound {
  const i = (((n - 1) % ORDER.length) + ORDER.length) % ORDER.length;
  return ORDER[i];
}

export const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

export function isCorrect(guess: string, sound: Sound): boolean {
  const g = normalize(guess);
  return [sound.answer, ...sound.aliases].some((a) => normalize(a) === g);
}

export function categoryOf(guess: string): Category | undefined {
  const g = normalize(guess);
  return OPTIONS.find((o) => normalize(o.label) === g)?.category;
}

export type Guess =
  | { kind: "skip" }
  | { kind: "guess"; text: string; correct: boolean; sameCategory: boolean };

export type Status = "playing" | "won" | "lost";

export function statusOf(guesses: Guess[]): Status {
  if (guesses.some((g) => g.kind === "guess" && g.correct)) return "won";
  return guesses.length >= MAX_TRIES ? "lost" : "playing";
}

export function shareText(n: number, guesses: Guess[]): string {
  const status = statusOf(guesses);
  const squares = guesses
    .map((g) => (g.kind === "skip" ? "⬛" : g.correct ? "🟩" : g.sameCategory ? "🟨" : "🟥"))
    .join("");
  const pad = "⬜".repeat(MAX_TRIES - guesses.length);
  const score = status === "won" ? `${guesses.length}/${MAX_TRIES}` : `X/${MAX_TRIES}`;
  return `Noisle #${n} ${score}\n🔊${squares}${pad}\n${location.origin}`;
}
