import { useEffect, useRef } from "react";
import { getAnalyser } from "../lib/audio";

const PER_SIDE = 14;
const HOLE = 124; // css px kept clear for the play button
const MAX_BIN = 100; // ~9 kHz at 48 kHz with fftSize 512

/**
 * Live spectrum on both sides of the play button: bass hugs the button,
 * treble fans out (log scale), mirrored so it reads like a voice.
 */
export function Visualizer({ active }: { active: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const g = el?.getContext("2d");
    if (!el || !g) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      el.width = el.clientWidth * dpr;
      el.height = el.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const data = new Uint8Array(512);
    const levels = new Float32Array(PER_SIDE);
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const frame = (t: number) => {
      const w = el.width;
      const h = el.height;
      g.clearRect(0, 0, w, h);
      const analyser = getAnalyser();
      if (active && analyser) analyser.getByteFrequencyData(data);
      const side = (w - HOLE * dpr) / 2;
      const gap = 3 * dpr;
      const bw = Math.max(2 * dpr, (side - gap * (PER_SIDE - 1)) / PER_SIDE);
      for (let j = 0; j < PER_SIDE; j++) {
        const bin = Math.floor(Math.pow(MAX_BIN + 1, j / (PER_SIDE - 1))) - 1;
        // average a few neighbouring bins so single tones don't flicker
        const v = active ? (data[bin] + data[bin + 1] + data[Math.max(0, bin - 1)]) / 3 / 255 : 0;
        const idle = reduceMotion ? 0.07 : 0.06 + 0.04 * Math.sin(t / 700 + j * 0.6);
        const target = active ? Math.pow(v, 1.3) : idle;
        levels[j] += (target - levels[j]) * (active ? 0.45 : 0.1);
        const bh = Math.max(3 * dpr, levels[j] * h * (1 - (j / PER_SIDE) * 0.3));
        g.fillStyle = active ? `rgba(163, 230, 53, ${0.35 + levels[j] * 0.65})` : "rgba(113, 113, 122, 0.3)";
        const y = (h - bh) / 2;
        const xr = w - side + j * (bw + gap);
        const xl = side - bw - j * (bw + gap);
        for (const x of [xl, xr]) {
          g.beginPath();
          g.roundRect(x, y, bw, bh, bw / 2);
          g.fill();
        }
      }
      if (active || !reduceMotion) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  return <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
