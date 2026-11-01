import type { Stats as S } from "../lib/storage";

export function Stats({ stats, highlight }: { stats: S; highlight?: number }) {
  const max = Math.max(1, ...stats.distribution);
  const cells: [string, number | string][] = [
    ["Played", stats.played],
    ["Win %", stats.played ? Math.round((stats.wins / stats.played) * 100) : 0],
    ["Streak", stats.streak],
    ["Best", stats.maxStreak],
  ];
  return (
    <div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {cells.map(([label, value]) => (
          <div key={label}>
            <div className="text-2xl font-bold tabular-nums">{value}</div>
            <div className="text-xs text-zinc-500">{label}</div>
          </div>
        ))}
      </div>
      <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">Guess distribution</h3>
      <div className="space-y-1.5">
        {stats.distribution.map((count, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 tabular-nums text-zinc-400">{i + 1}</span>
            <div
              className={`rounded px-2 py-0.5 text-right text-xs font-semibold tabular-nums ${highlight === i + 1 ? "bg-lime-400 text-zinc-950" : "bg-zinc-800"}`}
              style={{ width: `${Math.max(8, (count / max) * 100)}%` }}
            >
              {count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
