import { useCallback, useEffect, useRef, useState } from "react";
import { SOUNDS, SOUND_BY_ID } from "./data/sounds";
import { Dex } from "./components/Dex";
import { Game } from "./components/Game";
import { Help } from "./components/Help";
import { Menu } from "./components/Menu";
import { Modal } from "./components/Modal";
import { Stats } from "./components/Stats";
import { play, preload, stop, toggle, unlock } from "./lib/audio";
import { draw } from "./lib/bag";
import {
  CLASSIC_ROUNDS,
  CLIP_LENGTHS,
  MAX_TRIES,
  currentRound,
  guess,
  isLastRound,
  newRun,
  next,
  roundStatus,
  shareText,
  skip,
  unlockedSeconds,
  type GuessResult,
  type Mode,
  type Run,
} from "./lib/game";
import { addToDex, recordRun } from "./lib/record";
import * as store from "./lib/storage";

type Route = { name: "menu" } | { name: "play"; mode: Mode } | { name: "dex" };

function parseHash(): Route {
  const h = location.hash.replace(/^#\/?/, "");
  if (h === "classic" || h === "survival") return { name: "play", mode: h };
  if (h === "dex") return { name: "dex" };
  return { name: "menu" };
}

const ALL_IDS = SOUNDS.map((s) => s.id);

/** Draws fresh sounds from the shuffle bag and persists what's left. */
function drawSounds(n: number, avoid: string[] = []) {
  const { drawn, bag } = draw(store.loadBag(), ALL_IDS, n, avoid);
  store.saveBag(bag);
  return drawn;
}

const startRun = (mode: Mode) => newRun(mode, drawSounds(mode === "classic" ? CLASSIC_ROUNDS : 1));
const recentIds = (run: Run) => run.rounds.slice(-10).map((r) => r.soundId);

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash);
  const [run, setRun] = useState<Run | null>(null);
  const [stats, setStats] = useState(store.loadStats);
  const [dex, setDex] = useState(store.loadDex);
  const [modal, setModal] = useState<"help" | "stats" | null>(() => (store.hasSeenHelp() ? null : "help"));
  const [newBest, setNewBest] = useState(false);
  const [copied, setCopied] = useState(false);
  const pendingNext = useRef<string | null>(null);

  // ---- routing ----
  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (hash: string) => {
    stop();
    if (location.hash !== hash) location.hash = hash;
    else setRoute(parseHash());
  };

  // Opening #/classic or #/survival directly (or reloading) resumes the saved run.
  useEffect(() => {
    if (route.name !== "play") return;
    if (run?.mode === route.mode) return;
    const saved = store.loadRun(route.mode);
    const r = saved ?? startRun(route.mode);
    store.saveRun(r);
    pendingNext.current = null;
    setNewBest(false);
    setRun(r);
  }, [route, run?.mode]);

  useEffect(() => stop, [route.name]);

  // ---- prefetch the current and upcoming sound so playback starts instantly ----
  useEffect(() => {
    if (!run) return;
    const ids = [currentRound(run).soundId];
    if (run.mode === "classic" && run.rounds[run.current + 1]) ids.push(run.rounds[run.current + 1].soundId);
    ids.forEach((id) => preload(SOUND_BY_ID[id].file).catch(() => {}));
  }, [run?.id, run?.current]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = useCallback((r: Run) => {
    setRun(r);
    store.saveRun(r);
  }, []);

  /** After a guess or skip: play the longer clip, or the full sound on reveal. */
  const afterMove = useCallback(
    (r: Run) => {
      const round = currentRound(r);
      const url = SOUND_BY_ID[round.soundId].file;
      if (r.phase === "reveal") {
        play(url, CLIP_LENGTHS[MAX_TRIES - 1]);
        if (roundStatus(round) === "solved") {
          setDex((d) => {
            const nd = addToDex(d, round.soundId);
            store.saveDex(nd);
            return nd;
          });
        }
        if (r.mode === "survival" && !isLastRound(r)) {
          const [id] = drawSounds(1, recentIds(r));
          pendingNext.current = id;
          preload(SOUND_BY_ID[id].file).catch(() => {});
        }
      } else {
        play(url, unlockedSeconds(round));
      }
    },
    [],
  );

  const onGuess = (text: string): GuessResult => {
    unlock();
    if (!run) return { ok: false, reason: "not-playing" };
    const res = guess(run, text);
    if (res.ok) {
      commit(res.run);
      afterMove(res.run);
    }
    return res;
  };

  const onSkip = () => {
    unlock();
    if (!run) return;
    const r = skip(run);
    commit(r);
    afterMove(r);
  };

  const onNext = () => {
    unlock();
    if (!run || run.phase !== "reveal") return;
    let nextId: string | undefined;
    if (run.mode === "survival" && !isLastRound(run)) {
      nextId = pendingNext.current ?? drawSounds(1, recentIds(run))[0];
      pendingNext.current = null;
    }
    const r = next(run, nextId);
    commit(r);
    if (r.phase === "over") {
      stop();
      const rec = recordRun(stats, r);
      setStats(rec.stats);
      store.saveStats(rec.stats);
      setNewBest(rec.newBest);
    } else {
      play(SOUND_BY_ID[currentRound(r).soundId].file, CLIP_LENGTHS[0]);
    }
  };

  const startFresh = (mode: Mode) => {
    const r = startRun(mode);
    store.saveRun(r);
    pendingNext.current = null;
    setNewBest(false);
    setCopied(false);
    setRun(r);
    return r;
  };

  const onPlay = (mode: Mode, fresh: boolean) => {
    unlock();
    if (fresh) startFresh(mode);
    else {
      const saved = store.loadRun(mode);
      if (saved && saved.phase !== "over") setRun(saved);
      else startFresh(mode);
    }
    go(`#/${mode}`);
  };

  const onAgain = () => {
    unlock();
    if (!run) return;
    const r = startFresh(run.mode);
    play(SOUND_BY_ID[currentRound(r).soundId].file, CLIP_LENGTHS[0]);
  };

  const onShare = async () => {
    if (!run) return;
    const text = shareText(run, location.origin);
    try {
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* share sheet dismissed */
    }
  };

  // Space plays/stops the current clip when you're not typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || modal || route.name !== "play" || !run || run.phase === "over") return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "BUTTON" || tag === "TEXTAREA") return;
      e.preventDefault();
      unlock();
      const round = currentRound(run);
      const seconds = run.phase === "playing" ? unlockedSeconds(round) : CLIP_LENGTHS[MAX_TRIES - 1];
      toggle(SOUND_BY_ID[round.soundId].file, seconds);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, route.name, run]);

  const closeModal = () => {
    if (modal === "help") store.markHelpSeen();
    setModal(null);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-6">
      {route.name === "menu" && (
        <Menu
          saved={{ classic: store.loadRun("classic"), survival: store.loadRun("survival") }}
          stats={stats}
          dex={dex}
          onPlay={onPlay}
          onDex={() => go("#/dex")}
          onHelp={() => setModal("help")}
          onStats={() => setModal("stats")}
        />
      )}
      {route.name === "dex" && <Dex dex={dex} onBack={() => go("#/")} />}
      {route.name === "play" && run && run.mode === route.mode && (
        <Game
          run={run}
          newBest={newBest}
          copied={copied}
          onGuess={onGuess}
          onSkip={onSkip}
          onNext={onNext}
          onAgain={onAgain}
          onShare={onShare}
          onMenu={() => go("#/")}
          onHelp={() => setModal("help")}
        />
      )}

      {modal === "help" && (
        <Modal title="How to play" onClose={closeModal}>
          <Help />
          <button onClick={closeModal} className="mt-6 w-full rounded-xl bg-lime-400 py-3 font-semibold text-zinc-950 hover:bg-lime-300">
            Got it
          </button>
        </Modal>
      )}
      {modal === "stats" && (
        <Modal title="Statistics" onClose={closeModal}>
          <Stats stats={stats} dex={dex} />
        </Modal>
      )}
    </div>
  );
}
