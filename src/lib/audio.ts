import { useSyncExternalStore } from "react";

/**
 * One shared Web Audio engine: sample-accurate clip lengths, a buffer cache
 * with prefetching, and an analyser feeding the visualizer.
 */
export interface AudioState {
  url: string | null;
  playing: boolean;
  position: number; // seconds into the clip
  duration: number; // length of the clip being played
  failedUrl: string | null;
}

let state: AudioState = { url: null, playing: false, position: 0, duration: 0, failedUrl: null };
const listeners = new Set<() => void>();
const set = (patch: Partial<AudioState>) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
const cache = new Map<string, Promise<AudioBuffer>>();
let source: AudioBufferSourceNode | null = null;
let raf = 0;
let token = 0;

function context(): AudioContext {
  if (!ctx) {
    // iOS: play even when the ring/silent switch is on silent
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) nav.audioSession.type = "playback";
    ctx = new AudioContext();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.7;
    analyser.connect(ctx.destination);
  }
  return ctx;
}

/** Must run inside a user gesture at least once (Safari autoplay rules). */
export function unlock() {
  const c = context();
  if (c.state === "suspended") void c.resume();
}

export function preload(url: string): Promise<AudioBuffer> {
  let p = cache.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      })
      .then((b) => context().decodeAudioData(b));
    p.catch(() => cache.delete(url)); // allow a retry
    cache.set(url, p);
  }
  return p;
}

export function stop() {
  token++;
  cancelAnimationFrame(raf);
  if (source) {
    source.onended = null;
    try {
      source.stop();
    } catch {
      /* already stopped */
    }
    source = null;
  }
  if (state.playing || state.position) set({ playing: false, position: 0 });
}

export async function play(url: string, seconds: number) {
  stop();
  const mine = token;
  set({ url, failedUrl: state.failedUrl === url ? null : state.failedUrl });
  try {
    const c = context();
    if (c.state === "suspended") await c.resume();
    const buffer = await preload(url);
    if (mine !== token) return; // something else started meanwhile
    const duration = Math.min(seconds, buffer.duration);
    const src = c.createBufferSource();
    src.buffer = buffer;
    const gain = c.createGain();
    const t0 = c.currentTime + 0.03;
    // quick fades so cuts never click
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(1, t0 + 0.008);
    gain.gain.setValueAtTime(1, t0 + Math.max(0.01, duration - 0.03));
    gain.gain.linearRampToValueAtTime(0, t0 + duration);
    src.connect(gain).connect(analyser!);
    src.start(t0, 0, duration);
    source = src;
    set({ playing: true, position: 0, duration });
    const tick = () => {
      if (mine !== token) return;
      set({ position: Math.min(duration, Math.max(0, c.currentTime - t0)) });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    src.onended = () => {
      if (mine === token) stop();
    };
  } catch {
    if (mine === token) set({ playing: false, position: 0, failedUrl: url });
  }
}

/** Stops if this url is playing, otherwise plays it. */
export function toggle(url: string, seconds: number) {
  if (state.url === url && state.playing) stop();
  else void play(url, seconds);
}

export const getAnalyser = () => analyser;

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useAudio = () => useSyncExternalStore(subscribe, () => state);
