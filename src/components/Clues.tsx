import { CATEGORY_LABEL, type Sound } from "../data/sounds";
import { CLUE_AT, letterShape } from "../lib/game";

function Locked({ name, in: n }: { name: string; in: number }) {
  return (
    <div className="flex min-w-[45%] flex-1 items-center gap-2 rounded-lg border border-dashed border-zinc-800 px-3 py-2 text-xs text-zinc-500">
      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
      {name} in {n} {n === 1 ? "try" : "tries"}
    </div>
  );
}

/** Clues that unlock as you miss, so free-text guessing never feels hopeless. */
export function Clues({ sound, misses }: { sound: Sound; misses: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {misses >= CLUE_AT.category ? (
        <div className="pop w-full rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-sm text-sky-200">
          <span className="mr-2 text-xs uppercase tracking-wider text-sky-300/70">Category</span>
          {CATEGORY_LABEL[sound.category]}
        </div>
      ) : (
        <Locked name="Category" in={CLUE_AT.category - misses} />
      )}
      {misses >= CLUE_AT.letters ? (
        <div className="pop flex w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-violet-400/30 bg-violet-400/10 px-3 py-2">
          <span className="text-xs uppercase tracking-wider text-violet-300/70">Letters</span>
          {letterShape(sound.answer).map((word, i) => (
            <span key={i} className="flex gap-0.5 font-mono text-sm text-violet-100" aria-label={`${word.length} letters starting with ${word[0]}`}>
              {word.map((c, k) => (
                <span key={k} className={`grid h-6 w-[1.15rem] place-items-center rounded ${c === "_" ? "bg-violet-300/10 text-violet-300/40" : "bg-violet-300/20"}`}>
                  {c === "_" ? "" : c}
                </span>
              ))}
            </span>
          ))}
        </div>
      ) : (
        <Locked name="Letters" in={CLUE_AT.letters - misses} />
      )}
    </div>
  );
}
