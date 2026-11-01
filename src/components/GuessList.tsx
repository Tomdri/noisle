import { MAX_TRIES, type Guess } from "../lib/game";

export function GuessList({ guesses }: { guesses: Guess[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {Array.from({ length: MAX_TRIES }, (_, i) => {
        const g = guesses[i];
        const base = "flex h-11 items-center gap-3 rounded-lg border px-3 text-sm";
        if (!g) return <li key={i} className={`${base} border-zinc-800/70`} />;
        if (g.kind === "skip")
          return (
            <li key={i} className={`${base} pop border-zinc-800 text-zinc-500`}>
              <span aria-hidden>⏭</span> Skipped
            </li>
          );
        const tone = g.correct
          ? "border-lime-400/60 bg-lime-400/10 text-lime-300"
          : g.sameCategory
            ? "border-amber-400/50 bg-amber-400/10 text-amber-200"
            : "border-red-500/40 bg-red-500/10 text-red-200";
        return (
          <li key={i} className={`${base} pop ${tone}`}>
            <span aria-hidden>{g.correct ? "✓" : "✗"}</span>
            <span className="flex-1 truncate">{g.text}</span>
            {!g.correct && g.sameCategory && <span className="text-xs opacity-80">right category</span>}
          </li>
        );
      })}
    </ol>
  );
}
