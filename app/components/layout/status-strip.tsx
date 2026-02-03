import type { ReactNode } from "react";

type StatusStripProps = {
  children: ReactNode;
};

export const StatusStrip = Object.assign(
  ({ children }: StatusStripProps) => (
    <div className="grid animate-[rise-in_0.7s_ease_0.08s_both] gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))] motion-reduce:animate-none">
      {children}
    </div>
  ),
  {
    Stat: Object.assign(
      ({ children }: StatusStripProps) => (
        <div className="rounded-2xl border border-[var(--line)] bg-[rgba(17,21,32,0.85)] p-[18px] pb-4 shadow-[0_18px_40px_rgba(4,8,18,0.45)]">
          {children}
        </div>
      ),
      {
        Label: ({ children }: StatusStripProps) => (
          <div className="text-[0.62rem] uppercase tracking-[0.22em] text-[var(--ink-500)]">
            {children}
          </div>
        ),
        Value: ({ children }: StatusStripProps) => (
          <div className="mt-2 font-[var(--font-display)] text-[1.6rem] font-semibold text-[var(--fog-100)]">
            {children}
          </div>
        ),
      },
    ),
  },
);
