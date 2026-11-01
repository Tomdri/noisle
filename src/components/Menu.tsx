import { SOUNDS } from "../data/sounds";
import { CLASSIC_ROUNDS, solvedCount, type Mode, type Run } from "../lib/game";
import type { Dex, Stats } from "../lib/storage";
import { IconButton, Icon, Logo, TopBar } from "./TopBar";

interface Props {
  saved: Record<Mode, Run | null>;
  stats: Stats;
  dex: Dex;
  onPlay: (mode: Mode, fresh: boolean) => void;
  onDex: () => void;
  onHelp: () => void;
  onStats: () => void;
}

function ModeCard({ title, desc, badge, accent, resume, onPlay, onNew }: {
  title: string; desc: string; badge?: string; accent: string; resume?: string; onPlay: () => void; onNew: () => void;
}) {
  return (
    <div className="pop group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-zinc-700">
      <div className={`absolute -right-10 -top-10 size-32 rounded-full blur-3xl ${accent}`} aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{desc}</p>
        </div>
        {badge && <span className="shrink-0 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">{badge}</span>}
      </div>
      <div className="relative mt-4 flex gap-2">
        <button onClick={onPlay} className="flex-1 rounded-xl bg-lime-400 py-2.5 font-semibold text-zinc-950 transition hover:bg-lime-300 active:scale-[0.98]">
          {resume ?? "Play"}
        </button>
        {resume && (
          <button onClick={onNew} className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800">
            New game
          </button>
        )}
      </div>
    </div>
  );
}

export function Menu({ saved, stats, dex, onPlay, onDex, onHelp, onStats }: Props) {
  const found = SOUNDS.filter((s) => dex[s.id]).length;
  const live = (m: Mode) => (saved[m] && saved[m]!.phase !== "over" ? saved[m] : null);
  const c = live("classic");
  const s = live("survival");

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        left={<IconButton label="How to play" onClick={onHelp}>{Icon.help}</IconButton>}
        right={<IconButton label="Statistics" onClick={onStats}>{Icon.stats}</IconButton>}
      />
      <div className="mb-8 mt-4 flex flex-col items-center gap-3 text-center">
        <Logo size="lg" />
        <p className="text-zinc-400">Name that noise. Fewer seconds, more points.</p>
      </div>

      <div className="flex flex-col gap-3">
        <ModeCard
          title="Classic"
          desc={`${CLASSIC_ROUNDS} sounds. 6 tries each. How sharp are your ears?`}
          badge={stats.classic.best ? `Best ${stats.classic.best}` : undefined}
          accent="bg-lime-400/20"
          resume={c ? `Continue · ${c.current + 1}/${CLASSIC_ROUNDS}` : undefined}
          onPlay={() => onPlay("classic", !c)}
          onNew={() => onPlay("classic", true)}
        />
        <ModeCard
          title="Survival"
          desc="Endless sounds, 3 lives. How far can you go?"
          badge={stats.survival.best ? `Best ${stats.survival.best}` : undefined}
          accent="bg-rose-500/20"
          resume={s ? `Continue · ${solvedCount(s)} found` : undefined}
          onPlay={() => onPlay("survival", !s)}
          onNew={() => onPlay("survival", true)}
        />
        <button onClick={onDex} className="pop flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-left transition hover:border-zinc-700">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-violet-400/15 text-2xl" aria-hidden>📼</div>
          <div className="flex-1">
            <h2 className="font-bold">Sound Dex</h2>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full bg-violet-400" style={{ width: `${(found / SOUNDS.length) * 100}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-zinc-400">{found}/{SOUNDS.length} discovered</p>
          </div>
          <span className="text-zinc-500" aria-hidden>›</span>
        </button>
      </div>
    </div>
  );
}
