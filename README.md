# noisle 🔊

A daily sound-guessing game. Everyone gets the same mystery sound each day and has six tries to name it. The clip starts at half a second, and every wrong guess or skip unlocks more of it (0.5s → 1s → 2s → 4s → 8s → 16s).

- 🟩 correct · 🟨 right category · 🟥 wrong category · ⬛ skipped
- Streaks, stats and today's progress are saved in the browser
- Share your result as an emoji grid

## Run it

```bash
npm install
npm run dev
```

`npm run dev` and `npm run build` first run `scripts/gen-sounds.mjs`, which synthesizes the starter sounds into `public/sounds/gen/` (git-ignored).

## Adding sounds

The starter library is 20 sounds synthesized in code, so there are no licensing issues. To add a real recording:

1. Drop the file into `public/sounds/` (mp3/ogg/wav, at least 16 seconds, with the recognizable part *not* in the first second).
2. Add an entry to `SOUNDS` in `src/data/sounds.ts` with its answer, aliases, category and `file: "/sounds/your-file.mp3"`.

Free sources: [Freesound](https://freesound.org) (check each clip's license), [BBC Sound Effects](https://sound-effects.bbcrewind.co.uk) (personal/educational use), [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Audio_files).

The daily order is a fixed shuffle of `SOUNDS`, so **adding sounds reshuffles the schedule**. Before launch that doesn't matter; after launch, switch to an explicit schedule.

## Stack

Vite + React + TypeScript + Tailwind CSS v4. Static site, deploys anywhere (Vercel, Netlify, GitHub Pages).
