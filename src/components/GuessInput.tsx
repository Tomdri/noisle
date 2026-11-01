import { useMemo, useRef, useState } from "react";
import { OPTIONS } from "../data/sounds";
import { normalize } from "../lib/game";

interface Props {
  onGuess: (text: string) => void;
  onSkip: () => void;
  skipLabel: string;
  used: string[];
}

export function GuessInput({ onGuess, onSkip, skipLabel, used }: Props) {
  const [text, setText] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const q = normalize(text);
    if (!q) return [];
    const usedSet = new Set(used.map(normalize));
    return OPTIONS.filter((o) => !usedSet.has(normalize(o.label)))
      .map((o) => ({ o, idx: normalize(o.label).indexOf(q) }))
      .filter((m) => m.idx >= 0)
      .sort((a, b) => a.idx - b.idx || a.o.label.localeCompare(b.o.label))
      .slice(0, 6)
      .map((m) => m.o);
  }, [text, used]);

  const exact = OPTIONS.find((o) => normalize(o.label) === normalize(text));
  const alreadyUsed = used.some((u) => normalize(u) === normalize(text));

  const submit = (label?: string) => {
    const value = label ?? exact?.label ?? matches[active]?.label;
    if (!value || used.some((u) => normalize(u) === normalize(value))) return;
    onGuess(value);
    setText("");
    setOpen(false);
    setActive(0);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      {open && matches.length > 0 && (
        <ul className="absolute bottom-full mb-2 w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl" role="listbox">
          {matches.map((m, i) => (
            <li key={m.label} role="option" aria-selected={i === active}>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => submit(m.label)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left ${i === active ? "bg-zinc-800" : ""}`}
              >
                <span>{m.label}</span>
                <span className="text-xs text-zinc-500">{m.category}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            submit();
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder="What's that sound?"
        aria-label="Your guess"
        autoComplete="off"
        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-base outline-none placeholder:text-zinc-500 focus:border-lime-400/70"
      />
      {alreadyUsed && <p className="mt-1.5 text-xs text-zinc-500">You already tried that one.</p>}
      <div className="mt-3 flex gap-3">
        <button onClick={onSkip} className="flex-1 rounded-xl border border-zinc-800 py-3 font-medium text-zinc-300 transition hover:bg-zinc-900">
          {skipLabel}
        </button>
        <button
          onClick={() => submit()}
          disabled={!exact && matches.length === 0}
          className="flex-1 rounded-xl bg-zinc-100 py-3 font-semibold text-zinc-950 transition hover:bg-white disabled:opacity-40"
        >
          Guess
        </button>
      </div>
    </div>
  );
}
