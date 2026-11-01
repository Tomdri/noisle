import type { Guess } from "./game";

export interface Stats {
  played: number;
  wins: number;
  streak: number;
  maxStreak: number;
  lastPlayed: number; // puzzle number of the last finished game
  lastWon: number;
  /** distribution[i] = wins on attempt i+1 */
  distribution: number[];
}

const EMPTY_STATS: Stats = { played: 0, wins: 0, streak: 0, maxStreak: 0, lastPlayed: 0, lastWon: 0, distribution: [0, 0, 0, 0, 0, 0] };

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / storage full: the game still works, it just won't remember */
  }
}

export const loadGuesses = (n: number): Guess[] => read<{ g: Guess[] }>(`noisle:day:${n}`, { g: [] }).g;
export const saveGuesses = (n: number, g: Guess[]) => write(`noisle:day:${n}`, { g });

export function loadStats(today: number): Stats {
  const s = read("noisle:stats", EMPTY_STATS);
  // a streak breaks if you missed yesterday's puzzle
  if (s.lastWon < today - 1) s.streak = 0;
  return s;
}

/** Records a finished game exactly once per puzzle. */
export function recordResult(n: number, won: boolean, tries: number): Stats {
  const s = read("noisle:stats", EMPTY_STATS);
  if (s.lastPlayed >= n) return loadStats(n);
  s.played++;
  s.lastPlayed = n;
  if (won) {
    s.wins++;
    s.streak = s.lastWon === n - 1 ? s.streak + 1 : 1;
    s.maxStreak = Math.max(s.maxStreak, s.streak);
    s.lastWon = n;
    s.distribution = [...s.distribution];
    s.distribution[tries - 1]++;
  } else {
    s.streak = 0;
  }
  write("noisle:stats", s);
  return s;
}

export const hasSeenHelp = () => read("noisle:help", { seen: false }).seen;
export const markHelpSeen = () => write("noisle:help", { seen: true });
