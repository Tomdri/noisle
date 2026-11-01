import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Plays the first `seconds` of an audio file with sample accuracy (Web Audio),
 * exposing playback position for the progress bar.
 */
export function useClipPlayer(url: string) {
  const ctxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<Promise<AudioBuffer> | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const rafRef = useRef(0);
  const [position, setPosition] = useState(0); // seconds into the clip
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  const ctx = () => (ctxRef.current ??= new AudioContext());

  const load = useCallback(() => {
    bufferRef.current ??= fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.arrayBuffer();
      })
      .then((b) => ctx().decodeAudioData(b));
    return bufferRef.current;
  }, [url]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    try {
      sourceRef.current?.stop();
    } catch {
      /* already stopped */
    }
    sourceRef.current = null;
    setPlaying(false);
    setPosition(0);
  }, []);

  const play = useCallback(
    async (seconds: number) => {
      stop();
      try {
        const c = ctx();
        if (c.state === "suspended") await c.resume();
        const buffer = await load();
        const duration = Math.min(seconds, buffer.duration);
        const src = c.createBufferSource();
        src.buffer = buffer;
        // short fade-out so the cut doesn't click
        const gain = c.createGain();
        const t0 = c.currentTime + 0.02;
        gain.gain.setValueAtTime(1, t0 + Math.max(0, duration - 0.04));
        gain.gain.linearRampToValueAtTime(0, t0 + duration);
        src.connect(gain).connect(c.destination);
        src.start(t0, 0, duration);
        sourceRef.current = src;
        setPlaying(true);
        const tick = () => {
          const p = Math.max(0, c.currentTime - t0);
          setPosition(Math.min(p, duration));
          if (p < duration) rafRef.current = requestAnimationFrame(tick);
        };
        tick();
        src.onended = () => {
          if (sourceRef.current === src) stop();
        };
      } catch {
        setError(true);
        stop();
      }
    },
    [load, stop],
  );

  useEffect(() => {
    load().catch(() => setError(true)); // prefetch
    return () => stop();
  }, [load, stop]);

  return { play, stop, playing, position, error };
}
