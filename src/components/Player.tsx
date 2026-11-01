import { CLIP_LENGTHS } from "../lib/game";
import { play, toggle, useAudio } from "../lib/audio";
import { Visualizer } from "./Visualizer";

interface Props {
  url: string;
  /** Number of clip segments unlocked (1..6). */
  unlocked: number;
}

/** Equal-width segments so the half-second first clip is still visible. */
function segmentFill(i: number, position: number) {
  const start = i === 0 ? 0 : CLIP_LENGTHS[i - 1];
  return Math.max(0, Math.min(1, (position - start) / (CLIP_LENGTHS[i] - start)));
}

export function Player({ url, unlocked }: Props) {
  const audio = useAudio();
  const mine = audio.url === url;
  const playing = mine && audio.playing;
  const position = mine ? audio.position : 0;
  const failed = audio.failedUrl === url;
  const seconds = CLIP_LENGTHS[unlocked - 1];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative grid h-28 w-full place-items-center">
        <Visualizer active={playing} />
        <button
          onClick={() => toggle(url, seconds)}
          aria-label={playing ? "Stop" : `Play ${seconds} seconds`}
          className={`relative grid size-24 place-items-center rounded-full bg-lime-400 text-zinc-950 shadow-[0_0_50px_-10px] shadow-lime-400/70 transition hover:bg-lime-300 active:scale-95 ${playing ? "pulse-ring" : ""}`}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" className="size-9" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="ml-1 size-10" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
          )}
        </button>
      </div>

      <div className="w-full">
        <div className="flex gap-1">
          {CLIP_LENGTHS.map((_, i) => (
            <div key={i} className={`h-2 flex-1 overflow-hidden rounded-full transition-colors ${i < unlocked ? "bg-zinc-700" : "bg-zinc-800/50"}`}>
              <div className="h-full bg-lime-400" style={{ width: `${(i < unlocked ? segmentFill(i, position) : 0) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-xs tabular-nums text-zinc-500">
          <span>{position.toFixed(1)}s</span>
          <span>{seconds}s unlocked</span>
        </div>
      </div>
      {failed && (
        <p className="text-sm text-red-400">
          Couldn't load this sound.{" "}
          <button className="underline" onClick={() => play(url, seconds)}>
            Try again
          </button>
        </p>
      )}
    </div>
  );
}

/** Small round play/stop button for lists (results, Sound Dex). */
export function MiniPlay({ url, seconds = 16, label }: { url: string; seconds?: number; label: string }) {
  const audio = useAudio();
  const playing = audio.url === url && audio.playing;
  return (
    <button
      onClick={() => toggle(url, seconds)}
      aria-label={playing ? `Stop ${label}` : `Play ${label}`}
      className={`grid size-9 shrink-0 place-items-center rounded-full transition ${playing ? "bg-lime-400 text-zinc-950" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"}`}
    >
      {playing ? (
        <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" className="ml-0.5 size-4" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg>
      )}
    </button>
  );
}
