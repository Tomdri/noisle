import { describe, expect, it } from "vitest";
import { SOUNDS } from "../data/sounds";
import { draw } from "./bag";
import { CLASSIC_ROUNDS, MAX_TRIES, guess, letterShape, newRun, next, roundPoints, runScore, shareText, skip, type Run } from "./game";
import { EMPTY_STATS } from "./storage";
import { addToDex, recordRun } from "./record";

const ids = ["doorbell", "rain", "kettle", "car-horn", "crickets"];
const g = (run: Run, text: string) => {
  const r = guess(run, text);
  if (!r.ok) throw new Error(r.reason);
  return r.run;
};

describe("classic run", () => {
  it("plays 5 rounds and scores by tries", () => {
    let run = newRun("classic", ids, "t1");
    run = g(run, "Doorbell"); // try 1 → 100
    expect(run.phase).toBe("reveal");
    run = next(run);
    run = skip(run);
    run = g(run, "water"); // close
    run = g(run, "rain"); // try 3 → 60
    run = next(run);
    for (let i = 0; i < MAX_TRIES; i++) run = skip(run); // failed → 0
    expect(run.phase).toBe("reveal");
    run = next(run);
    run = g(run, "honk"); // 100
    run = next(run);
    run = g(run, "cricket"); // 100
    expect(run.current).toBe(CLASSIC_ROUNDS - 1);
    run = next(run);
    expect(run.phase).toBe("over");
    expect(run.rounds.map(roundPoints)).toEqual([100, 60, 0, 100, 100]);
    expect(runScore(run)).toBe(360);
    expect(shareText(run, "https://x")).toBe("Noisle 🔊 360/500\n1️⃣ 3️⃣ ❌ 1️⃣ 1️⃣\nhttps://x");
  });

  it("rejects duplicate guesses without using a try", () => {
    let run = newRun("classic", ids);
    run = g(run, "bell");
    const again = guess(run, "  BELL ");
    expect(again).toEqual({ ok: false, reason: "duplicate" });
    expect(run.rounds[0].guesses).toHaveLength(1);
  });

  it("ignores input outside the playing phase", () => {
    let run = g(newRun("classic", ids), "doorbell");
    expect(guess(run, "rain")).toEqual({ ok: false, reason: "not-playing" });
    expect(skip(run)).toBe(run);
    run = next(run);
    expect(next(run)).toBe(run); // can't skip ahead while playing
  });
});

describe("survival run", () => {
  it("loses a life per missed sound and ends at zero", () => {
    let run = newRun("survival", ["doorbell"]);
    expect(run.lives).toBe(3);
    run = g(run, "doorbell");
    run = next(run, "rain");
    for (let k = 0; k < 3; k++) {
      for (let i = 0; i < MAX_TRIES; i++) run = skip(run);
      expect(run.lives).toBe(2 - k);
      run = next(run, "kettle");
    }
    expect(run.phase).toBe("over");
    expect(run.rounds).toHaveLength(4);
    expect(shareText(run, "u")).toBe("Noisle Survival 🔊 1 sound\n1️⃣ ❌ ❌ ❌\nu");
  });

  it("requires a next sound id", () => {
    const run = g(newRun("survival", ["doorbell"]), "doorbell");
    expect(() => next(run)).toThrow();
  });
});

describe("bag", () => {
  const all = SOUNDS.map((s) => s.id);
  it("never repeats within a draw and covers every sound before repeating", () => {
    let bag: string[] = [];
    const seen: string[] = [];
    for (let i = 0; i < 4; i++) {
      const d = draw(bag, all, 5);
      expect(new Set(d.drawn).size).toBe(5);
      seen.push(...d.drawn);
      bag = d.bag;
    }
    expect(new Set(seen).size).toBe(all.length);
  });
  it("keeps avoided ids out of the draw", () => {
    const d = draw([], all, 5, all.slice(0, 15));
    expect(d.drawn.every((id) => !all.slice(0, 15).includes(id))).toBe(true);
  });
  it("drops ids that no longer exist", () => {
    const d = draw(["gone", "rain"], all, 1);
    expect(d.drawn).toEqual(["rain"]);
  });
});

describe("records", () => {
  it("counts a finished run once", () => {
    let run = g(newRun("classic", ["doorbell"], "r1"), "doorbell");
    run = next(run);
    const a = recordRun(EMPTY_STATS, run);
    expect(a.newBest).toBe(true);
    expect(a.stats.classic).toMatchObject({ games: 1, best: 100, total: 100 });
    expect(a.stats.classic.dist[0]).toBe(1);
    expect(recordRun(a.stats, run).stats).toBe(a.stats);
  });
  it("tracks the dex", () => {
    expect(addToDex(addToDex({}, "rain"), "rain")).toEqual({ rain: { found: 2 } });
  });
});

it("letter shape shows first letters only", () => {
  expect(letterShape("Bouncing ball")).toEqual([["B", "_", "_", "_", "_", "_", "_", "_"], ["b", "_", "_", "_"]]);
});
