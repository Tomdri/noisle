import { CATEGORY_LABEL, SOUNDS } from "../data/sounds";
import type { Dex as DexData } from "../lib/storage";
import { MiniPlay } from "./Player";
import { IconButton, Icon, TopBar } from "./TopBar";

export function Dex({ dex, onBack }: { dex: DexData; onBack: () => void }) {
  const found = SOUNDS.filter((s) => dex[s.id]).length;
  return (
    <div className="flex flex-1 flex-col">
      <TopBar left={<IconButton label="Back to menu" onClick={onBack}>{Icon.back}</IconButton>} title={<h1 className="font-bold">Sound Dex</h1>} />
      <p className="mb-4 text-center text-sm text-zinc-400">
        {found === SOUNDS.length ? "You found them all. Legendary ears. 👂" : `${found} of ${SOUNDS.length} found. Identify a sound in a game to unlock it.`}
      </p>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SOUNDS.map((s, i) => {
          const entry = dex[s.id];
          return (
            <li key={s.id} className={`flex items-center gap-3 rounded-xl border p-3 ${entry ? "border-zinc-800 bg-zinc-900/60" : "border-dashed border-zinc-800/80"}`}>
              <span className="w-6 text-xs tabular-nums text-zinc-600">#{String(i + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <p className={`truncate font-medium ${entry ? "" : "text-zinc-600"}`}>{entry ? s.answer : "? ? ?"}</p>
                <p className="truncate text-xs text-zinc-500">{entry ? `${CATEGORY_LABEL[s.category]} · found ×${entry.found}` : "Not discovered yet"}</p>
              </div>
              {entry ? (
                <MiniPlay url={s.file} label={s.answer} />
              ) : (
                <span className="grid size-9 place-items-center text-zinc-700" aria-hidden>
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
