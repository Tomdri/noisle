import { SOUND_BY_ID } from "../data/sounds";
import { judge, sameGuess, type Verdict } from "./match";

/** Seconds of audio unlocked at each try. */
export const CLIP_LENGTHS = [0.5, 1, 2, 4, 8, 16];
export const MAX_TRIES = CLIP_LENGTHS.length;
/** Points for solving on try 1..6. */
export const POINTS = [100, 80, 60, 40, 20, 10];
export const CLASSIC_ROUNDS = 5;
export const SURVIVAL_LIVES = 3;
/** Misses needed before each clue unlocks. */
export const CLUE_AT = { category: 2, letters: 4 };

export type Mode = "classic" | "survival";
export type Guess = { kind: "skip" } | { kind: "guess"; text: string; verdict: Verdict };
export interface Round {
  soundId: string;
  guesses: Guess[];
}
export type Phase = "playing" | "reveal" | "over";
export interface Run {
  id: string;
  mode: Mode;
  rounds: Round[];
  current: number;
  lives: number;
  phase: Phase;
}

export type RoundStatus = "playing" | "solved" | "failed";

export function roundStatus(r: Round): RoundStatus {
  if (r.guesses.some((g) => g.kind === "guess" && g.verdict === "correct")) return "solved";
  return r.guesses.length >= MAX_TRIES ? "failed" : "playing";
}

export const roundPoints = (r: Round) => (roundStatus(r) === "solved" ? POINTS[r.guesses.length - 1] : 0);
export const runScore = (run: Run) => run.rounds.reduce((sum, r) => sum + roundPoints(r), 0);
export const solvedCount = (run: Run) => run.rounds.filter((r) => roundStatus(r) === "solved").length;
export const currentRound = (run: Run) => run.rounds[run.current];
/** Clip length (s) available right now in a round. */
export const unlockedSeconds = (r: Round) => CLIP_LENGTHS[Math.min(r.guesses.length, MAX_TRIES - 1)];

export function newRun(mode: Mode, soundIds: string[], id = Date.now().toString(36)): Run {
  return {
    id,
    mode,
    rounds: soundIds.map((soundId) => ({ soundId, guesses: [] })),
    current: 0,
    lives: mode === "survival" ? SURVIVAL_LIVES : 0,
    phase: "playing",
  };
}

function addGuess(run: Run, g: Guess): Run {
  if (run.phase !== "playing") return run;
  const round = currentRound(run);
  const updated: Round = { ...round, guesses: [...round.guesses, g] };
  const rounds = run.rounds.map((r, i) => (i === run.current ? updated : r));
  const status = roundStatus(updated);
  if (status === "playing") return { ...run, rounds };
  const lives = run.mode === "survival" && status === "failed" ? run.lives - 1 : run.lives;
  return { ...run, rounds, lives, phase: "reveal" };
}

export type GuessResult = { ok: true; run: Run; verdict: Verdict } | { ok: false; reason: "duplicate" | "not-playing" };

export function guess(run: Run, text: string): GuessResult {
  if (run.phase !== "playing") return { ok: false, reason: "not-playing" };
  const round = currentRound(run);
  if (round.guesses.some((g) => g.kind === "guess" && sameGuess(g.text, text))) return { ok: false, reason: "duplicate" };
  const verdict = judge(text, SOUND_BY_ID[round.soundId]);
  return { ok: true, verdict, run: addGuess(run, { kind: "guess", text: text.trim(), verdict }) };
}

export const skip = (run: Run) => addGuess(run, { kind: "skip" });

export function isLastRound(run: Run): boolean {
  return run.mode === "classic" ? run.current >= run.rounds.length - 1 : run.lives <= 0;
}

/** Moves on from a revealed round. Survival needs the next sound id. */
export function next(run: Run, nextSoundId?: string): Run {
  if (run.phase !== "reveal") return run;
  if (isLastRound(run)) return { ...run, phase: "over" };
  if (run.mode === "survival") {
    if (!nextSoundId) throw new Error("survival needs a next sound");
    return { ...run, rounds: [...run.rounds, { soundId: nextSoundId, guesses: [] }], current: run.current + 1, phase: "playing" };
  }
  return { ...run, current: run.current + 1, phase: "playing" };
}

const KEYCAPS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣"];

export function shareText(run: Run, url: string): string {
  const marks = run.rounds.map((r) => (roundStatus(r) === "solved" ? KEYCAPS[r.guesses.length - 1] : "❌")).join(" ");
  const head =
    run.mode === "classic"
      ? `Noisle 🔊 ${runScore(run)}/${CLASSIC_ROUNDS * POINTS[0]}`
      : `Noisle Survival 🔊 ${solvedCount(run)} sound${solvedCount(run) === 1 ? "" : "s"}`;
  return `${head}\n${marks}\n${url}`;
}

export function rating(score: number): string {
  if (score >= 500) return "Perfect ears 👂";
  if (score >= 400) return "Sound sommelier";
  if (score >= 280) return "Sharp listener";
  if (score >= 150) return "Getting there";
  if (score > 0) return "Headphones on next time?";
  return "Total silence 🙉";
}

/** "Bouncing ball" → [["B","_",...],["b","_",...]] with the first letter of each word shown. */
export function letterShape(answer: string): string[][] {
  return answer.split(" ").map((w) => [...w].map((c, i) => (i === 0 ? c : "_")));
}
