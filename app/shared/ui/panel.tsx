import type { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
};

export const Panel = Object.assign(
  ({ children }: PanelProps) => (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-[var(--shadow)] backdrop-blur-[14px] animate-[rise-in_0.7s_ease_0.16s_both] motion-reduce:animate-none">
      {children}
    </div>
  ),
  {
    Title: ({ children }: PanelProps) => (
      <h2 className="m-0 mb-3.5 font-[var(--font-display)] text-[1.2rem] tracking-[0.01em]">
        {children}
      </h2>
    ),
  },
);
