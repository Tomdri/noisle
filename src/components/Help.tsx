import { CLASSIC_ROUNDS, CLIP_LENGTHS, CLUE_AT, MAX_TRIES, POINTS, SURVIVAL_LIVES } from "../lib/game";

export function Help() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
      <p>Listen, then <b>type what you think the sound is</b>. Plain words are fine: "ball bouncing", "someone clapping".</p>
      <ul className="space-y-2.5">
        <li>🔊 You start with <b>{CLIP_LENGTHS[0]}s</b>. Every miss or skip unlocks more: {CLIP_LENGTHS.map((s) => `${s}s`).join(" → ")}.</li>
        <li>🟨 <b>Close</b> means you're on the right track. Be more specific.</li>
        <li>🔒 Clues unlock as you miss: the <b>category</b> after {CLUE_AT.category}, the <b>letters</b> after {CLUE_AT.letters}.</li>
        <li>⭐ Faster is better: {POINTS.join(" / ")} points for solving on try 1 to {MAX_TRIES}.</li>
      </ul>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-zinc-900 p-3"><b className="text-zinc-100">Classic</b><br />{CLASSIC_ROUNDS} sounds. Max {CLASSIC_ROUNDS * POINTS[0]} points.</div>
        <div className="rounded-lg bg-zinc-900 p-3"><b className="text-zinc-100">Survival</b><br />Endless. {SURVIVAL_LIVES} lives. One per missed sound.</div>
      </div>
      <p className="text-zinc-500">Every sound you identify is added to your Sound Dex. Tip: <kbd className="rounded bg-zinc-800 px-1">Space</kbd> plays/stops.</p>
    </div>
  );
}
