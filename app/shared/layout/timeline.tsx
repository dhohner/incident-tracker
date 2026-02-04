import type { ReactNode } from "react";

type TimelineProps = {
  children: ReactNode;
};

export const Timeline = Object.assign(
  ({ children }: TimelineProps) => (
    <div className="grid gap-3.5">{children}</div>
  ),
  {
    Item: Object.assign(
      ({ children }: TimelineProps) => (
        <div className="grid gap-2 rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(12,15,24,0.92)] p-4 shadow-[0_14px_28px_rgba(4,8,18,0.5)] animate-[rise-in_0.6s_ease_both] motion-reduce:animate-none">
          {children}
        </div>
      ),
      {
        Header: ({ children }: TimelineProps) => (
          <div className="flex justify-between gap-3 text-[0.82rem] text-[var(--ink-500)]">
            {children}
          </div>
        ),
        Title: ({ children }: TimelineProps) => (
          <p className="m-0 text-[1rem] text-[var(--fog-100)]">{children}</p>
        ),
      },
    ),
  },
);
