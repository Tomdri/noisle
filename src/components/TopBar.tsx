import type { ReactNode } from "react";

export function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="grid size-10 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100">
      {children}
    </button>
  );
}

export const Icon = {
  back: <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>,
  help: <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01" /></svg>,
  stats: <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 20V12M12 20V5M19 20v-6" /></svg>,
};

export function TopBar({ left, title, right }: { left?: ReactNode; title?: ReactNode; right?: ReactNode }) {
  return (
    <header className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center py-3">
      <div>{left}</div>
      <div className="text-center">{title}</div>
      <div>{right}</div>
    </header>
  );
}

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <span className={`inline-flex items-center gap-2 font-black tracking-tight ${big ? "text-5xl" : "text-xl"}`}>
      <span className="flex items-end gap-[3px]" aria-hidden>
        {(big ? [16, 28, 40, 22] : [8, 14, 20, 11]).map((h, i) => (
          <span key={i} className={`eq-bar rounded-full bg-lime-400 ${big ? "w-[7px]" : "w-[4px]"}`} style={{ height: h, animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
      noisle
    </span>
  );
}
