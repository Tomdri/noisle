import { CLIP_LENGTHS, MAX_TRIES } from "../lib/game";

export function Help() {
  return (
    <div className="space-y-4 text-sm text-zinc-300">
      <p>Guess today's sound in {MAX_TRIES} tries.</p>
      <ul className="space-y-2">
        <li>🔊 You start with just <b>{CLIP_LENGTHS[0]}s</b> of audio.</li>
        <li>⏭ Every wrong guess or skip unlocks more: {CLIP_LENGTHS.map((s) => `${s}s`).join(" → ")}.</li>
        <li>🟨 Yellow means your guess was in the right category.</li>
        <li>🟥 Red means wrong category too.</li>
      </ul>
      <p className="text-zinc-500">A new sound drops every day at midnight.</p>
    </div>
  );
}
