import { MAX_TRIES, roundStatus, runScore, solvedCount, type Run } from "./game";
import type { Dex, Stats } from "./storage";

/** Adds a finished run to stats exactly once. Returns whether it set a new best. */
export function recordRun(stats: Stats, run: Run): { stats: Stats; newBest: boolean } {
  if (run.phase !== "over" || stats.recorded.includes(run.id)) return { stats, newBest: false };
  const recorded = [...stats.recorded, run.id].slice(-50);
  const score = runScore(run);
  if (run.mode === "classic") {
    const dist = [...stats.classic.dist];
    for (const r of run.rounds) dist[roundStatus(r) === "solved" ? r.guesses.length - 1 : MAX_TRIES]++;
    const newBest = score > stats.classic.best;
    return {
      newBest,
      stats: {
        ...stats,
        recorded,
        classic: { games: stats.classic.games + 1, best: Math.max(stats.classic.best, score), total: stats.classic.total + score, dist },
      },
    };
  }
  const found = solvedCount(run);
  const newBest = found > stats.survival.best;
  return {
    newBest,
    stats: {
      ...stats,
      recorded,
      survival: { runs: stats.survival.runs + 1, best: Math.max(stats.survival.best, found), bestScore: Math.max(stats.survival.bestScore, score) },
    },
  };
}

export function addToDex(dex: Dex, soundId: string): Dex {
  return { ...dex, [soundId]: { found: (dex[soundId]?.found ?? 0) + 1 } };
}
