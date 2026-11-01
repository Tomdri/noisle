import { CATEGORY_LABEL, SOUND_BY_ID } from "../data/sounds";
import {
  CLASSIC_ROUNDS,
  CLIP_LENGTHS,
  MAX_TRIES,
  POINTS,
  SURVIVAL_LIVES,
  currentRound,
  isLastRound,
  rating,
  roundPoints,
  roundStatus,
  runScore,
  solvedCount,
  type GuessResult,
  type Round,
  type Run,
} from "../lib/game";
import { Clues } from "./Clues";
import { GuessInput } from "./GuessInput";
import { GuessList } from "./GuessList";
import { MiniPlay, Player } from "./Player";
import { IconButton, Icon, TopBar } from "./TopBar";

interface Props {
  run: Run;
  newBest: boolean;
  copied: boolean;
  onGuess: (text: string) => GuessResult;
  onSkip: () => void;
  onNext: () => void;
  onAgain: () => void;
  onShare: () => void;
  onMenu: () => void;
  onHelp: () => void;
}

function RoundPills({ run }: { run: Run }) {
  return (
    <div className="flex gap-1.5" aria-label={`Sound ${run.current + 1} of ${CLASSIC_ROUNDS}`}>
      {run.rounds.map((r, i) => {
        const s = roundStatus(r);
        const cls =
          s === "solved" ? "bg-lime-400 text-zinc-950"
          : s === "failed" ? "bg-red-500/80 text-white"
          : i === run.current ? "ring-2 ring-lime-400 text-lime-300"
          : "bg-zinc-800 text-zinc-500";
        return (
          <span key={i} title={s === "solved" ? `Solved in ${r.guesses.length}` : undefined} className={`grid size-7 place-items-center rounded-lg text-xs font-bold tabular-nums transition ${cls}`}>
            {s === "solved" ? "✓" : s === "failed" ? "✗" : i + 1}
          </span>
        );
      })}
    </div>
  );
}

function Lives({ lives }: { lives: number }) {
  return (
    <div className="flex gap-1 text-lg" aria-label={`${lives} lives left`}>
      {Array.from({ length: SURVIVAL_LIVES }, (_, i) => (
        <span key={i} className={i < lives ? "" : "opacity-20 grayscale"} aria-hidden>❤️</span>
      ))}
    </div>
  );
}

function Reveal({ run, round, onNext }: { run: Run; round: Round; onNext: () => void }) {
  const sound = SOUND_BY_ID[round.soundId];
  const solved = roundStatus(round) === "solved";
  const last = isLastRound(run);
  return (
    <div className={`pop rounded-2xl border p-5 text-center ${solved ? "border-lime-400/40 bg-lime-400/5" : "border-zinc-800 bg-zinc-900/60"}`}>
      <p className={`text-sm font-medium ${solved ? "text-lime-300" : "text-zinc-400"}`}>
        {solved
          ? `${round.guesses.length === 1 ? "First try!" : `Got it in ${round.guesses.length}`} · +${roundPoints(round)}`
          : run.mode === "survival" ? "Out of tries · −1 ❤️" : "Out of tries"}
      </p>
      <h2 className="mt-1 text-3xl font-bold">{sound.answer}</h2>
      <p className="mt-1 text-xs text-zinc-500">{CATEGORY_LABEL[sound.category]}</p>
      <button
        autoFocus
        onClick={onNext}
        className="mt-5 w-full rounded-xl bg-lime-400 py-3 font-semibold text-zinc-950 transition hover:bg-lime-300 active:scale-[0.98]"
      >
        {last ? "See results" : "Next sound →"}
      </button>
    </div>
  );
}

function Summary({ run, newBest, copied, onShare, onAgain, onMenu }: Pick<Props, "run" | "newBest" | "copied" | "onShare" | "onAgain" | "onMenu">) {
  const score = runScore(run);
  const found = solvedCount(run);
  const classic = run.mode === "classic";
  return (
    <div className="pop flex flex-col gap-5">
      <div className="text-center">
        {newBest && <span className="mb-3 inline-block rounded-full bg-lime-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-950">New best!</span>}
        {classic ? (
          <>
            <p className="text-6xl font-black tabular-nums">
              {score}<span className="text-2xl text-zinc-500">/{CLASSIC_ROUNDS * POINTS[0]}</span>
            </p>
            <p className="mt-2 text-lg text-zinc-300">{rating(score)}</p>
          </>
        ) : (
          <>
            <p className="text-6xl font-black tabular-nums">{found}</p>
            <p className="mt-2 text-lg text-zinc-300">sound{found === 1 ? "" : "s"} survived · {score} pts</p>
          </>
        )}
      </div>

      <ul className="flex flex-col gap-1.5">
        {run.rounds.map((r, i) => {
          const s = SOUND_BY_ID[r.soundId];
          const solved = roundStatus(r) === "solved";
          return (
            <li key={i} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2">
              <span className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${solved ? "bg-lime-400 text-zinc-950" : "bg-red-500/80 text-white"}`}>
                {solved ? r.guesses.length : "✗"}
              </span>
              <span className="min-w-0 flex-1 truncate">{s.answer}</span>
              <span className={`text-sm tabular-nums ${solved ? "text-lime-300" : "text-zinc-600"}`}>+{roundPoints(r)}</span>
              <MiniPlay url={s.file} label={s.answer} />
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-2">
        <button onClick={onShare} className="rounded-xl bg-lime-400 py-3 font-semibold text-zinc-950 transition hover:bg-lime-300 active:scale-[0.98]">
          {copied ? "Copied to clipboard!" : "Share result"}
        </button>
        <div className="flex gap-2">
          <button onClick={onAgain} className="flex-1 rounded-xl border border-zinc-700 py-3 font-medium transition hover:bg-zinc-900">Play again</button>
          <button onClick={onMenu} className="flex-1 rounded-xl border border-zinc-800 py-3 font-medium text-zinc-400 transition hover:bg-zinc-900">Menu</button>
        </div>
      </div>
    </div>
  );
}

export function Game(props: Props) {
  const { run, onGuess, onSkip, onNext, onMenu, onHelp } = props;
  const round = currentRound(run);
  const sound = SOUND_BY_ID[round.soundId];
  const classic = run.mode === "classic";
  const playing = run.phase === "playing";
  const tries = round.guesses.length;
  const unlocked = playing ? tries + 1 : MAX_TRIES;
  const nextGain = tries < MAX_TRIES - 1 ? CLIP_LENGTHS[tries + 1] - CLIP_LENGTHS[tries] : 0;

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        left={<IconButton label="Back to menu" onClick={onMenu}>{Icon.back}</IconButton>}
        title={
          <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
            {classic ? "Classic" : "Survival"}
          </h1>
        }
        right={<IconButton label="How to play" onClick={onHelp}>{Icon.help}</IconButton>}
      />

      {run.phase === "over" ? (
        <Summary {...props} />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            {classic ? <RoundPills run={run} /> : <Lives lives={run.lives} />}
            <div className="text-right">
              <p className="text-lg font-bold tabular-nums leading-none">{runScore(run)}</p>
              <p className="text-xs text-zinc-500">{classic ? "points" : `${solvedCount(run)} found`}</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <Player url={sound.file} unlocked={unlocked} />
            {playing && <Clues sound={sound} misses={tries} />}
            <GuessList guesses={round.guesses} />
            <div className="mt-auto pt-2">
              {playing ? (
                <GuessInput
                  roundKey={`${run.id}:${run.current}`}
                  onGuess={onGuess}
                  onSkip={onSkip}
                  skipLabel={nextGain ? `Skip (+${nextGain}s)` : "Give up"}
                />
              ) : (
                <Reveal run={run} round={round} onNext={onNext} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
