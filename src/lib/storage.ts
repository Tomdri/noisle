import type { Mode, Run } from "./game";

const KEY = {
  run: (m: Mode) => `noisle:v2:run:${m}`,
  stats: "noisle:v2:stats",
  dex: "noisle:v2:dex",
  bag: "noisle:v2:bag",
  help: "noisle:v2:help",
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or full storage: the game still works, it just won't remember */
  }
}

// ---- runs in progress ----
export const loadRun = (mode: Mode): Run | null => {
  const r = read<Run | null>(KEY.run(mode), null);
  return r && Array.isArray(r.rounds) && r.rounds.length > 0 ? r : null;
};
export const saveRun = (run: Run) => write(KEY.run(run.mode), run);
export const clearRun = (mode: Mode) => write(KEY.run(mode), undefined);

// ---- stats ----
export interface Stats {
  classic: { games: number; best: number; total: number; /** solves on try 1..6, then misses */ dist: number[] };
  survival: { runs: number; best: number; bestScore: number };
  recorded: string[]; // run ids already counted
}

export const EMPTY_STATS: Stats = {
  classic: { games: 0, best: 0, total: 0, dist: [0, 0, 0, 0, 0, 0, 0] },
  survival: { runs: 0, best: 0, bestScore: 0 },
  recorded: [],
};

export const loadStats = (): Stats => {
  const s = read<Partial<Stats>>(KEY.stats, {});
  return {
    classic: { ...EMPTY_STATS.classic, ...s.classic },
    survival: { ...EMPTY_STATS.survival, ...s.survival },
    recorded: s.recorded ?? [],
  };
};
export const saveStats = (s: Stats) => write(KEY.stats, s);

// ---- sound dex ----
export type Dex = Record<string, { found: number }>;
export const loadDex = (): Dex => read<Dex>(KEY.dex, {});
export const saveDex = (d: Dex) => write(KEY.dex, d);

// ---- misc ----
export const loadBag = (): string[] => read<string[]>(KEY.bag, []);
export const saveBag = (b: string[]) => write(KEY.bag, b);
export const hasSeenHelp = () => read(KEY.help, false);
export const markHelpSeen = () => write(KEY.help, true);
