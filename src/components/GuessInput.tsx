import { useEffect, useRef, useState, type FormEvent } from "react";
import type { GuessResult } from "../lib/game";
import { isMeaningful } from "../lib/match";

interface Props {
  onGuess: (text: string) => GuessResult;
  onSkip: () => void;
  skipLabel: string;
  /** Changes every round so the field resets and refocuses. */
  roundKey: string;
}

type Feedback = { tone: "close" | "wrong" | "info"; text: string } | null;

const CLOSE_LINES = ["Close! You're on the right track.", "Warmer… be more specific.", "Almost! Related, but not it."];
const WRONG_LINES = ["Not it. Listen again.", "Nope. More audio unlocked.", "Not quite. Try another angle."];
const pick = (arr: string[], n: number) => arr[n % arr.length];

const finePointer = () => matchMedia("(pointer: fine)").matches;

export function GuessInput({ onGuess, onSkip, skipLabel, roundKey }: Props) {
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [shake, setShake] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const count = useRef(0);

  useEffect(() => {
    setText("");
    setFeedback(null);
    if (finePointer()) input.current?.focus();
  }, [roundKey]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isMeaningful(text)) {
      setFeedback({ tone: "info", text: "Type what you think the sound is." });
      setShake((s) => s + 1);
      return;
    }
    const res = onGuess(text);
    if (!res.ok) {
      if (res.reason === "duplicate") {
        setFeedback({ tone: "info", text: "You already tried that one." });
        setShake((s) => s + 1);
      }
      return;
    }
    setText("");
    count.current++;
    if (res.verdict === "close") setFeedback({ tone: "close", text: pick(CLOSE_LINES, count.current) });
    else if (res.verdict === "wrong") setFeedback({ tone: "wrong", text: pick(WRONG_LINES, count.current) });
    else setFeedback(null);
    if (res.verdict !== "correct") setShake((s) => s + 1);
  };

  const tone = { close: "text-amber-300", wrong: "text-red-300", info: "text-zinc-400" };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <p aria-live="polite" className={`h-5 text-center text-sm ${feedback ? tone[feedback.tone] : ""}`}>
        {feedback?.text}
      </p>
      <input
        key={shake}
        ref={input}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (feedback?.tone === "info") setFeedback(null);
        }}
        placeholder="What's that sound?"
        aria-label="Your guess"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="send"
        maxLength={60}
        autoFocus={shake > 0 || undefined}
        className={`w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-base outline-none transition placeholder:text-zinc-500 focus:border-lime-400/70 ${shake ? "shake" : ""}`}
      />
      <div className="flex gap-3">
        <button type="button" onClick={onSkip} className="flex-1 rounded-xl border border-zinc-800 py-3 font-medium text-zinc-300 transition hover:bg-zinc-900">
          {skipLabel}
        </button>
        <button type="submit" disabled={!text.trim()} className="flex-1 rounded-xl bg-zinc-100 py-3 font-semibold text-zinc-950 transition hover:bg-white disabled:opacity-40">
          Guess
        </button>
      </div>
    </form>
  );
}
