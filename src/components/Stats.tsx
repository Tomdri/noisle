import { SOUNDS } from "../data/sounds";
import type { Dex, Stats as S } from "../lib/storage";

function Cell({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
    </div>
  );
}

export function Stats({ stats, dex }: { stats: S; dex: Dex }) {
  const { classic, survival } = stats;
  const max = Math.max(1, ...classic.dist);
  const found = SOUNDS.filter((s) => dex[s.id]).length;
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Classic</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Cell label="Games" value={classic.games} />
          <Cell label="Best" value={classic.best} />
          <Cell label="Average" value={classic.games ? Math.round(classic.total / classic.games) : 0} />
        </div>
        <div className="mt-4 space-y-1">
          {classic.dist.map((count, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-3 text-center tabular-nums text-zinc-400">{i < 6 ? i + 1 : "✗"}</span>
              <div
                className={`rounded px-2 py-0.5 text-right text-xs font-semibold tabular-nums ${i < 6 ? "bg-zinc-800" : "bg-red-500/20 text-red-200"}`}
                style={{ width: `${Math.max(8, (count / max) * 100)}%` }}
              >
                {count}
              </div>
            </div>
          ))}
          <p className="pt-1 text-xs text-zinc-500">Tries needed per sound (✗ = missed)</p>
        </div>
      </section>
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Survival</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Cell label="Runs" value={survival.runs} />
          <Cell label="Best streak" value={survival.best} />
          <Cell label="Best score" value={survival.bestScore} />
        </div>
      </section>
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Sound Dex</h3>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full bg-lime-400" style={{ width: `${(found / SOUNDS.length) * 100}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-zinc-400">{found} of {SOUNDS.length} sounds discovered</p>
      </section>
    </div>
  );
}
