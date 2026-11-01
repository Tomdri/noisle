import { useEffect, useState } from "react";
import type { Sound } from "../data/sounds";
import { MAX_TRIES } from "../lib/game";

function useCountdown() {
  const until = () => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return Math.max(0, next.getTime() - now.getTime());
  };
  const [ms, setMs] = useState(until);
  useEffect(() => {
    const id = setInterval(() => setMs(until()), 1000);
    return () => clearInterval(id);
  }, []);
  const s = Math.floor(ms / 1000);
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((v) => String(v).padStart(2, "0")).join(":");
}

interface Props {
  won: boolean;
  tries: number;
  sound: Sound;
  onShare: () => void;
  onPlayFull: () => void;
  copied: boolean;
}

export function Result({ won, tries, sound, onShare, onPlayFull, copied }: Props) {
  const countdown = useCountdown();
  return (
    <div className="pop flex flex-col items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center">
      <p className="text-sm text-zinc-400">{won ? (tries === 1 ? "First try. Unreal ears." : `Got it in ${tries}/${MAX_TRIES}`) : "Not today."}</p>
      <p className="text-sm uppercase tracking-wider text-zinc-500">It was</p>
      <h2 className={`-mt-3 text-3xl font-bold ${won ? "text-lime-300" : "text-zinc-100"}`}>{sound.answer}</h2>
      <div className="flex w-full gap-3">
        <button onClick={onPlayFull} className="flex-1 rounded-xl border border-zinc-700 py-3 font-medium hover:bg-zinc-800">
          Play full
        </button>
        <button onClick={onShare} className="flex-1 rounded-xl bg-lime-400 py-3 font-semibold text-zinc-950 hover:bg-lime-300">
          {copied ? "Copied!" : "Share"}
        </button>
      </div>
      <p className="text-xs text-zinc-500">
        Next sound in <span className="font-mono tabular-nums text-zinc-300">{countdown}</span>
      </p>
    </div>
  );
}
