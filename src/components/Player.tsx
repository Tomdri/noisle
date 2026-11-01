import { CLIP_LENGTHS } from "../lib/game";

interface Props {
  unlocked: number; // how many segments are unlocked (1..6)
  playing: boolean;
  position: number;
  onToggle: () => void;
  error: boolean;
}

/** Each segment gets equal width, so the tiny first clip is still visible. */
function fillFor(segment: number, position: number) {
  const start = segment === 0 ? 0 : CLIP_LENGTHS[segment - 1];
  const end = CLIP_LENGTHS[segment];
  return Math.max(0, Math.min(1, (position - start) / (end - start)));
}

export function Player({ unlocked, playing, position, onToggle, error }: Props) {
  const seconds = CLIP_LENGTHS[unlocked - 1];
  return (
    <div className="flex flex-col items-center gap-5">
      <button
        onClick={onToggle}
        aria-label={playing ? "Stop" : `Play ${seconds} seconds`}
        className={`relative grid size-24 place-items-center rounded-full bg-lime-400 text-zinc-950 shadow-[0_0_40px_-8px] shadow-lime-400/60 transition active:scale-95 hover:bg-lime-300 ${playing ? "pulse-ring" : ""}`}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" className="size-9" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" className="ml-1 size-10" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
        )}
      </button>

      <div className="w-full">
        <div className="flex gap-1">
          {CLIP_LENGTHS.map((_, i) => (
            <div key={i} className={`h-2.5 flex-1 overflow-hidden rounded-full ${i < unlocked ? "bg-zinc-700" : "bg-zinc-800/60"}`}>
              <div className="h-full bg-lime-400" style={{ width: `${(i < unlocked ? fillFor(i, position) : 0) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs tabular-nums text-zinc-500">
          <span>{position.toFixed(1)}s</span>
          <span>{seconds}s unlocked</span>
        </div>
      </div>
      {error && <p className="text-sm text-red-400">Couldn't load today's sound. Check your connection and refresh.</p>}
    </div>
  );
}
