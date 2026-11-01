# noisle 🔊

**Name that noise.** Hear a split second of a sound and guess what it is. Every miss unlocks more audio (0.5s → 1s → 2s → 4s → 8s → 16s), and the fewer seconds you need, the more points you get.

Live: https://noisle.vercel.app

## Modes

- **Classic**: 5 sounds, 6 tries each, 100/80/60/40/20/10 points per sound, score out of 500.
- **Survival**: endless sounds and 3 lives. Each missed sound costs a life.
- **Sound Dex**: every sound you identify is unlocked here and can be replayed.

There's no daily limit, so play as much as you like. A shuffle bag makes sure no sound repeats until you've heard them all.

## How guessing works

There's no dropdown to give answers away. You type what you hear, and `src/lib/match.ts` judges it:

- **Correct** if the guess contains every word of any accepted phrase. Extra words, word order, plurals, -ing/-ed forms and small typos are all fine ("ball bouncing", "a basketball", "bouncign ball").
- **Close** (yellow) if it hits a related phrase ("bell" for a doorbell).
- Typo tolerance never turns one real word into another ("click" won't count as "clock").

Clues unlock as you miss: the **category** after 2 misses, then the **letter shape** of the answer after 4.

## Run it

```bash
npm install
npm run dev      # also generates the starter sounds
npm test         # matcher + game logic tests
```

## Adding sounds

The starter library is 20 sounds synthesized by `scripts/gen-sounds.mjs` (written to `public/sounds/gen/`, git-ignored), so there are no licensing issues. To add a real recording:

1. Put the file in `public/sounds/` (mp3/ogg/wav, at least 16 seconds, with the recognizable part *not* right at the start).
2. Add an entry to `SOUNDS` in `src/data/sounds.ts` with `answer`, `category`, `accept` and `close` phrases, and `file: "/sounds/your-file.mp3"`.
3. Run `npm test`. It checks that every accept phrase works and that no answer accidentally counts as correct for a different sound.

Free sources: [Freesound](https://freesound.org) (check each clip's license), [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk) (personal/educational use), [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Audio_files).

## Stack

Vite + React + TypeScript + Tailwind CSS v4, Web Audio API (sample-accurate clips, live spectrum visualizer), Vitest. Static site; progress and stats are stored in the browser.
