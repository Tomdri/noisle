import { SOUNDS, type Sound } from "../data/sounds";

export type Verdict = "correct" | "close" | "wrong";

/** Filler words people type that never change what they mean. */
const STOPWORDS = new Set(
  ("a an the of on in at to by for from with and or is are it its this that these those my your his her their our " +
    "some someone somebody something thing things sound sounds noise noises like kind sort type maybe i think guess " +
    "being being person guy people's very really just very lot lots loud quiet little big").split(" "),
);

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Tiny English stemmer: enough to make "bouncing", "bounces" and "bounce" agree. */
export function stem(word: string): string {
  let w = word;
  if (w.length <= 3) return w;
  if (w.endsWith("ies") && w.length > 4) w = w.slice(0, -3) + "y";
  else if (w.endsWith("ing") && w.length > 5) w = w.slice(0, -3);
  else if (w.endsWith("ed") && w.length > 4) w = w.slice(0, -2);
  else if (w.endsWith("es") && w.length > 4) w = w.slice(0, -2);
  else if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) w = w.slice(0, -1);
  if (w.endsWith("e") && w.length > 3) w = w.slice(0, -1);
  const last = w[w.length - 1];
  if (w.length > 3 && last === w[w.length - 2] && !"aeiou".includes(last)) w = w.slice(0, -1);
  return w;
}

const words = (s: string) => normalize(s).split(" ").filter((w) => w && !STOPWORDS.has(w));

/** Optimal-string-alignment distance (Levenshtein + adjacent swaps), capped for speed. */
export function editDistance(a: string, b: string, max = 3): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/** Every word the game knows. Typo tolerance never turns one real word into another. */
const LEXICON = new Set<string>();
for (const s of SOUNDS) {
  for (const phrase of [...s.accept, ...s.close, s.answer]) {
    for (const w of words(phrase)) {
      LEXICON.add(w);
      LEXICON.add(stem(w));
    }
  }
}

function allowedTypos(target: string): number {
  if (target.length >= 8) return 2;
  if (target.length >= 5) return 1;
  return 0;
}

interface GuessWord {
  raw: string;
  stem: string;
  /** Typo tolerance only applies to unknown, single typed words. */
  fuzzy: boolean;
}

function prepareGuess(text: string): GuessWord[] {
  const raw = words(text);
  // "door bell" should also match "doorbell", so add joined neighbours too
  const joined = raw.slice(1).map((w, i) => raw[i] + w);
  const known = (w: string) => LEXICON.has(w) || LEXICON.has(stem(w));
  return [
    ...raw.map((w) => ({ raw: w, stem: stem(w), fuzzy: !known(w) })),
    ...joined.map((w) => ({ raw: w, stem: stem(w), fuzzy: false })),
  ];
}

function wordHit(target: string, guess: GuessWord[]): boolean {
  const t = stem(target);
  return guess.some((g) => {
    if (g.raw === target || g.stem === t) return true;
    if (!g.fuzzy) return false;
    const n = allowedTypos(target);
    return n > 0 && (editDistance(g.raw, target, n) <= n || editDistance(g.stem, t, n) <= n);
  });
}

function phraseHit(phrase: string, guess: GuessWord[]): boolean {
  const ws = words(phrase);
  if (ws.length === 0) return false;
  if (ws.every((w) => wordHit(w, guess))) return true;
  return ws.length > 1 && wordHit(ws.join(""), guess); // "doorbell" typed for "door bell"
}

export function judge(text: string, sound: Sound): Verdict {
  const guess = prepareGuess(text);
  if (guess.length === 0) return "wrong";
  if ([sound.answer, ...sound.accept].some((p) => phraseHit(p, guess))) return "correct";
  if (sound.close.some((p) => phraseHit(p, guess))) return "close";
  return "wrong";
}

/** True if the text has at least one meaningful word to judge. */
export const isMeaningful = (text: string) => words(text).some((w) => w.length >= 2);

export const sameGuess = (a: string, b: string) => normalize(a) === normalize(b);
