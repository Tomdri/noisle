import { MAX_TRIES, type Guess } from "../lib/game";

const STYLE = {
  correct: "border-lime-400/60 bg-lime-400/10 text-lime-200",
  close: "border-amber-400/50 bg-amber-400/10 text-amber-100",
  wrong: "border-red-500/40 bg-red-500/10 text-red-200",
};

export function GuessList({ guesses }: { guesses: Guess[] }) {
  return (
    <ol className="flex flex-col gap-1.5" aria-label="Your guesses">
      {Array.from({ length: MAX_TRIES }, (_, i) => {
        const g = guesses[i];
        const base = "flex h-10 items-center gap-3 rounded-lg border px-3 text-sm";
        if (!g) return <li key={i} className={`${base} border-zinc-800/60`} aria-hidden />;
        if (g.kind === "skip")
          return (
            <li key={i} className={`${base} pop border-zinc-800 text-zinc-500`}>
              <span aria-hidden>⏭</span> Skipped
            </li>
          );
        return (
          <li key={i} className={`${base} pop ${STYLE[g.verdict]}`}>
            <span aria-hidden className="w-4 text-center">{g.verdict === "correct" ? "✓" : g.verdict === "close" ? "≈" : "✗"}</span>
            <span className="flex-1 truncate">{g.text}</span>
            {g.verdict === "close" && <span className="text-xs font-medium uppercase tracking-wider opacity-80">close</span>}
          </li>
        );
      })}
    </ol>
  );
}
