import type { ReactNode } from "react";

type TrackedTicketProps = {
  children: ReactNode;
};

export const TrackedTicket = Object.assign(
  ({ children }: TrackedTicketProps) => (
    <div className="mb-4 rounded-[18px] border border-[rgba(54,214,194,0.4)] bg-[linear-gradient(135deg,rgba(54,214,194,0.15),transparent_55%),rgba(12,15,24,0.96)] p-[18px] shadow-[0_22px_40px_rgba(4,8,18,0.6)]">
      {children}
    </div>
  ),
  {
    Header: ({ children }: TrackedTicketProps) => (
      <div className="flex items-center justify-between gap-3">
        {children}
      </div>
    ),
    Key: ({ children }: TrackedTicketProps) => (
      <span className="font-[var(--font-mono)] text-[0.78rem] text-[var(--ink-500)]">
        {children}
      </span>
    ),
    Badge: ({ children }: TrackedTicketProps) => (
      <span className="rounded-full border border-[rgba(54,214,194,0.5)] bg-[rgba(8,10,16,0.6)] px-2 py-1 text-[0.7rem] uppercase tracking-[0.16em] text-[var(--fog-200)]">
        {children}
      </span>
    ),
  },
);
