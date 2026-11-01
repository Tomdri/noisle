// Synthesizes the starter sound library as WAV files in public/sounds/gen/.
// These are placeholders built from code (no licensing concerns). Swap them
// for real recordings over time: put files in public/sounds/ and point the
// entry's `file` in src/data/sounds.ts at them.
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RATE = 22050;
const LENGTH = 16; // seconds; the longest clip the game plays
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sounds", "gen");

// ---------- helpers ----------
const TAU = Math.PI * 2;
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const buf = () => new Float32Array(RATE * LENGTH);
const sec = (i) => i / RATE;
const saw = (ph) => 2 * (ph - Math.floor(ph + 0.5));
const square = (ph) => (ph % 1 < 0.5 ? 1 : -1);

/** Adds a decaying tone (bell/beep/thump) starting at `start` seconds. */
function tone(out, start, dur, freq, { amp = 0.5, decay = 0, attack = 0.005, partials = [[1, 1]], wave = Math.sin } = {}) {
  const s0 = Math.floor(start * RATE);
  const n = Math.floor(dur * RATE);
  for (let i = 0; i < n && s0 + i < out.length; i++) {
    const t = i / RATE;
    let env = Math.min(1, t / attack);
    if (decay) env *= Math.exp(-t / decay);
    const rel = Math.min(1, (dur - t) / 0.01); // click-free release
    let v = 0;
    for (const [mult, a] of partials) v += a * wave(TAU * freq * mult * t);
    out[s0 + i] += amp * env * rel * v;
  }
}

/** Adds a burst of filtered noise. */
function burst(out, r, start, dur, { amp = 0.5, decay = 0.02, cutoff = 0.3 } = {}) {
  const s0 = Math.floor(start * RATE);
  const n = Math.floor(dur * RATE);
  let lp = 0;
  for (let i = 0; i < n && s0 + i < out.length; i++) {
    lp += cutoff * (r() * 2 - 1 - lp);
    out[s0 + i] += amp * Math.exp(-(i / RATE) / decay) * lp;
  }
}

function lowpass(x, a) {
  let y = 0;
  for (let i = 0; i < x.length; i++) x[i] = y += a * (x[i] - y);
  return x;
}

// ---------- sounds (ids must match src/data/sounds.ts) ----------
const sounds = {
  doorbell(o) {
    const bell = { amp: 0.35, decay: 0.9, partials: [[1, 1], [2.76, 0.3], [5.4, 0.12]] };
    for (let t = 0.1; t < LENGTH; t += 4) {
      tone(o, t, 2.5, 659, bell);
      tone(o, t + 0.7, 2.8, 523, bell);
    }
  },
  "phone-ring"(o) {
    // classic landline: 440+480 Hz with a fast bell-clapper flutter
    for (let t = 0.1; t < LENGTH; t += 6) {
      const s0 = Math.floor(t * RATE);
      for (let i = 0; i < 2 * RATE && s0 + i < o.length; i++) {
        const x = i / RATE;
        const flutter = 0.6 + 0.4 * square(x * 20);
        o[s0 + i] += 0.25 * flutter * (Math.sin(TAU * 440 * x) + Math.sin(TAU * 480 * x));
      }
    }
  },
  "busy-signal"(o) {
    for (let t = 0; t < LENGTH; t += 1) {
      tone(o, t, 0.5, 480, { amp: 0.25, partials: [[1, 1], [620 / 480, 1]] });
    }
  },
  "police-siren"(o) {
    let ph = 0;
    for (let i = 0; i < o.length; i++) {
      const f = 950 + 400 * Math.sin(TAU * sec(i) / 4 - Math.PI / 2);
      ph += f / RATE;
      o[i] = 0.3 * (0.7 * Math.sin(TAU * ph) + 0.3 * saw(ph));
    }
  },
  heartbeat(o) {
    const beat = 60 / 72;
    for (let t = 0.2; t < LENGTH; t += beat) {
      tone(o, t, 0.25, 55, { amp: 0.9, decay: 0.06, attack: 0.01, partials: [[1, 1], [2, 0.4]] });
      tone(o, t + 0.28, 0.2, 48, { amp: 0.6, decay: 0.05, attack: 0.01, partials: [[1, 1], [2, 0.4]] });
    }
  },
  "clock-ticking"(o) {
    const r = rng(7);
    for (let k = 0; k < LENGTH; k++) {
      burst(o, r, k + 0.05, 0.03, { amp: 0.9, decay: 0.004, cutoff: 0.9 });
      tone(o, k + 0.05, 0.03, k % 2 ? 2400 : 3000, { amp: 0.25, decay: 0.006 });
    }
  },
  "smoke-alarm"(o) {
    for (let t = 0.1; t < LENGTH; t += 4) {
      for (let k = 0; k < 3; k++) tone(o, t + k, 0.5, 3150, { amp: 0.3, partials: [[1, 1], [3, 0.15]] });
    }
  },
  microwave(o) {
    const r = rng(3);
    let lp = 0;
    for (let i = 0; i < o.length; i++) {
      const t = sec(i);
      lp += 0.05 * (r() * 2 - 1 - lp);
      const hum = 0.12 * Math.sin(TAU * 60 * t) + 0.08 * Math.sin(TAU * 120 * t);
      const running = t < 9 ? 1 : Math.max(0, 1 - (t - 9) * 4);
      o[i] = running * (hum + 0.5 * lp);
    }
    for (let k = 0; k < 3; k++) tone(o, 9.6 + k * 0.7, 0.4, 1950, { amp: 0.3 });
  },
  "ocean-waves"(o) {
    const r = rng(11);
    let lp = 0;
    for (let i = 0; i < o.length; i++) {
      const t = sec(i);
      const swell = Math.pow(0.5 + 0.5 * Math.sin(TAU * t / 7 - 1.2), 2.2);
      const a = 0.04 + 0.25 * swell;
      lp += a * (r() * 2 - 1 - lp);
      o[i] = (0.25 + 1.4 * swell) * lp;
    }
  },
  rain(o) {
    const r = rng(5);
    let lp = 0;
    for (let i = 0; i < o.length; i++) {
      lp += 0.5 * (r() * 2 - 1 - lp);
      o[i] = 0.12 * lp;
    }
    for (let k = 0; k < LENGTH * 40; k++) burst(o, r, r() * LENGTH, 0.02, { amp: 0.3 * r(), decay: 0.003, cutoff: 0.8 });
  },
  "morse-sos"(o) {
    const u = 0.1;
    let t = 0.2;
    while (t < LENGTH - 2) {
      for (const sym of "...---...") {
        const len = sym === "." ? u : 3 * u;
        tone(o, t, len, 700, { amp: 0.35 });
        t += len + u;
      }
      t += 7 * u;
    }
  },
  "reversing-truck"(o) {
    const r = rng(9);
    lowpass(o.map(() => r() * 2 - 1), 0.02).forEach((v, i) => (o[i] = 0.6 * v)); // diesel rumble
    for (let t = 0.2; t < LENGTH; t += 1.1) tone(o, t, 0.55, 1050, { amp: 0.32, partials: [[1, 1], [2, 0.2]] });
  },
  kettle(o) {
    const r = rng(13);
    let lp = 0;
    let ph = 0;
    for (let i = 0; i < o.length; i++) {
      const t = sec(i);
      lp += 0.08 * (r() * 2 - 1 - lp);
      const rumble = 0.25 * Math.min(1, t / 3) * lp;
      const whistleAmt = Math.min(1, Math.max(0, (t - 6) / 3));
      const f = 1500 + 400 * Math.min(1, Math.max(0, (t - 6) / 6)) + 15 * Math.sin(TAU * 5 * t);
      ph += f / RATE;
      o[i] = rumble + 0.3 * whistleAmt * Math.sin(TAU * ph);
    }
  },
  "car-horn"(o) {
    const honk = (t, d) => tone(o, t, d, 415, { amp: 0.16, wave: (x) => saw(x / TAU), partials: [[1, 1], [523 / 415, 1]] });
    for (let t = 0.2; t < LENGTH; t += 4) {
      honk(t, 0.3);
      honk(t + 0.45, 1.1);
    }
  },
  crickets(o) {
    for (let t = 0.1; t < LENGTH; t += 0.9) {
      for (let k = 0; k < 3; k++) tone(o, t + k * 0.05, 0.035, 4600, { amp: 0.2 });
    }
  },
  applause(o) {
    const r = rng(17);
    for (let k = 0; k < LENGTH * 120; k++) {
      const t = r() * LENGTH;
      const env = Math.min(1, t / 1.5);
      burst(o, r, t, 0.03, { amp: env * (0.2 + 0.3 * r()), decay: 0.006, cutoff: 0.5 + 0.4 * r() });
    }
  },
  typing(o) {
    const r = rng(19);
    let t = 0.2;
    while (t < LENGTH) {
      burst(o, r, t, 0.03, { amp: 0.5 + 0.4 * r(), decay: 0.005, cutoff: 0.7 });
      t += r() < 0.08 ? 0.4 + r() * 0.5 : 0.07 + r() * 0.12; // occasional pause between words
      if (r() < 0.03) {
        burst(o, r, t, 0.05, { amp: 0.9, decay: 0.012, cutoff: 0.4 }); // space bar
        t += 0.15;
      }
    }
  },
  helicopter(o) {
    const r = rng(23);
    let lp = 0;
    for (let i = 0; i < o.length; i++) {
      const t = sec(i);
      lp += 0.15 * (r() * 2 - 1 - lp);
      const chop = Math.pow(0.5 + 0.5 * Math.sin(TAU * 11 * t), 6);
      o[i] = (0.2 + 1.6 * chop) * lp + 0.08 * Math.sin(TAU * 90 * t);
    }
  },
  "bouncing-ball"(o) {
    let t = 0.3;
    let gap = 0.75;
    while (t < LENGTH) {
      let a = 0.9;
      let g = gap;
      while (g > 0.03 && t < LENGTH) {
        tone(o, t, 0.12, 180, { amp: a, decay: 0.03, attack: 0.002, partials: [[1, 1], [2.3, 0.3]] });
        t += g;
        g *= 0.78;
        a *= 0.88;
      }
      t += 1.5;
    }
  },
  "dripping-tap"(o) {
    for (let t = 0.3; t < LENGTH; t += 1.3) {
      const s0 = Math.floor(t * RATE);
      let ph = 0;
      for (let i = 0; i < 0.12 * RATE && s0 + i < o.length; i++) {
        const x = i / RATE;
        ph += (900 + 9000 * x) / RATE; // rising "plip"
        o[s0 + i] += 0.5 * Math.exp(-x / 0.03) * Math.sin(TAU * ph);
      }
    }
  },
};

// ---------- write WAVs ----------
function wav(samples) {
  let peak = 0;
  for (const v of samples) peak = Math.max(peak, Math.abs(v));
  const gain = peak > 0 ? 0.89 / peak : 0;
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v * gain)) * 32767), i * 2));
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); // PCM
  h.writeUInt16LE(1, 22); // mono
  h.writeUInt32LE(RATE, 24);
  h.writeUInt32LE(RATE * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

mkdirSync(OUT, { recursive: true });
let made = 0;
for (const [id, fn] of Object.entries(sounds)) {
  const file = join(OUT, `${id}.wav`);
  if (existsSync(file) && !process.argv.includes("--force")) continue;
  const o = buf();
  fn(o);
  writeFileSync(file, wav(o));
  made++;
}
console.log(`noisle: ${made} sound(s) generated, ${Object.keys(sounds).length} total in public/sounds/gen`);
