import { useCallback, useEffect, useMemo, useState } from "react";
import { Player } from "./components/Player";
import { GuessInput } from "./components/GuessInput";
import { GuessList } from "./components/GuessList";
import { Result } from "./components/Result";
import { Modal } from "./components/Modal";
import { Help } from "./components/Help";
import { Stats } from "./components/Stats";
import { useClipPlayer } from "./lib/useClipPlayer";
import {
  CLIP_LENGTHS,
  MAX_TRIES,
  categoryOf,
  isCorrect,
  puzzleNumber,
  shareText,
  soundForPuzzle,
  statusOf,
  type Guess,
} from "./lib/game";
import { hasSeenHelp, loadGuesses, loadStats, markHelpSeen, recordResult, saveGuesses } from "./lib/storage";

export default function App() {
  const n = useMemo(() => puzzleNumber(), []);
  const sound = useMemo(() => soundForPuzzle(n), [n]);
  const [guesses, setGuesses] = useState<Guess[]>(() => loadGuesses(n));
  const [stats, setStats] = useState(() => loadStats(n));
  const [modal, setModal] = useState<"help" | "stats" | null>(() => (hasSeenHelp() ? null : "help"));
  const [copied, setCopied] = useState(false);
  const player = useClipPlayer(sound.file);

  const status = statusOf(guesses);
  const unlocked = status === "playing" ? guesses.length + 1 : MAX_TRIES;
  const nextSeconds = CLIP_LENGTHS[Math.min(guesses.length + 1, MAX_TRIES - 1)];

  const commit = useCallback(
    (g: Guess) => {
      const next = [...guesses, g];
      setGuesses(next);
      saveGuesses(n, next);
      player.stop();
      const s = statusOf(next);
      if (s !== "playing") {
        setStats(recordResult(n, s === "won", next.length));
        setTimeout(() => setModal("stats"), 1400);
      }
    },
    [guesses, n, player],
  );

  const onGuess = (text: string) =>
    commit({ kind: "guess", text, correct: isCorrect(text, sound), sameCategory: categoryOf(text) === sound.category });

  const onShare = async () => {
    const text = shareText(n, guesses);
    try {
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled the share sheet */
    }
  };

  // spacebar plays/stops when you're not typing
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || (e.target as HTMLElement).tagName === "INPUT" || modal) return;
      e.preventDefault();
      if (player.playing) player.stop();
      else player.play(CLIP_LENGTHS[unlocked - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [player, unlocked, modal]);

  const closeModal = () => {
    if (modal === "help") markHelpSeen();
    setModal(null);
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-8">
      <header className="flex items-center justify-between py-4">
        <button onClick={() => setModal("help")} aria-label="How to play" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01" strokeLinecap="round" /></svg>
        </button>
        <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight">
          <span className="flex items-end gap-[3px]" aria-hidden>
            {[8, 14, 20, 11].map((h, i) => (
              <span key={i} className="eq-bar w-[4px] rounded-full bg-lime-400" style={{ height: h, animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
          noisle
        </h1>
        <button onClick={() => setModal("stats")} aria-label="Statistics" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 20V12M12 20V5M19 20v-6" /></svg>
        </button>
      </header>

      <p className="mb-6 text-center text-xs uppercase tracking-[0.2em] text-zinc-500">Daily sound #{n}</p>

      <main className="flex flex-1 flex-col gap-6">
        <Player
          unlocked={unlocked}
          playing={player.playing}
          position={player.position}
          error={player.error}
          onToggle={() => (player.playing ? player.stop() : player.play(CLIP_LENGTHS[unlocked - 1]))}
        />

        <GuessList guesses={guesses} />

        <div className="mt-auto">
          {status === "playing" ? (
            <GuessInput
              onGuess={onGuess}
              onSkip={() => commit({ kind: "skip" })}
              skipLabel={guesses.length === MAX_TRIES - 1 ? "Give up" : `Skip (+${nextSeconds - CLIP_LENGTHS[guesses.length]}s)`}
              used={guesses.flatMap((g) => (g.kind === "guess" ? [g.text] : []))}
            />
          ) : (
            <Result
              won={status === "won"}
              tries={guesses.length}
              sound={sound}
              copied={copied}
              onShare={onShare}
              onPlayFull={() => (player.playing ? player.stop() : player.play(CLIP_LENGTHS[MAX_TRIES - 1]))}
            />
          )}
        </div>
      </main>

      {modal === "help" && (
        <Modal title="How to play" onClose={closeModal}>
          <Help />
          <button onClick={closeModal} className="mt-6 w-full rounded-xl bg-lime-400 py-3 font-semibold text-zinc-950 hover:bg-lime-300">
            Let's listen
          </button>
        </Modal>
      )}
      {modal === "stats" && (
        <Modal title="Statistics" onClose={closeModal}>
          <Stats stats={stats} highlight={status === "won" ? guesses.length : undefined} />
          {status !== "playing" && (
            <button onClick={onShare} className="mt-6 w-full rounded-xl bg-lime-400 py-3 font-semibold text-zinc-950 hover:bg-lime-300">
              {copied ? "Copied!" : "Share result"}
            </button>
          )}
        </Modal>
      )}
    </div>
  );
}
