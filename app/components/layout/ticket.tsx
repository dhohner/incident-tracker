import type { ReactNode } from "react";

type TicketProps = {
  children: ReactNode;
  tracked?: boolean;
};

type TicketSlotProps = {
  children: ReactNode;
};

export const Ticket = Object.assign(
  ({ children, tracked = false }: TicketProps) => (
    <div
      className={`grid gap-2.5 rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(12,15,24,0.9)] p-[18px] shadow-[0_18px_32px_rgba(4,8,18,0.55)] transition-[transform,box-shadow] duration-200 ease-[ease] hover:-translate-y-1 hover:shadow-[0_24px_40px_rgba(4,8,18,0.6)] animate-[rise-in_0.6s_ease_both] motion-reduce:animate-none${tracked ? " border-[rgba(54,214,194,0.35)] shadow-[0_24px_46px_rgba(4,8,18,0.65)]" : ""}`}
    >
      {children}
    </div>
  ),
  {
    Key: ({ children }: TicketSlotProps) => (
      <div className="font-[var(--font-mono)] text-[0.78rem] text-[var(--ink-500)]">
        {children}
      </div>
    ),
    Title: ({ children }: TicketSlotProps) => (
      <h3 className="m-0 text-[1.02rem] text-[var(--fog-100)]">{children}</h3>
    ),
    Meta: ({ children }: TicketSlotProps) => (
      <div className="flex flex-wrap items-center gap-2 text-[0.85rem] text-[var(--ink-500)]">
        {children}
      </div>
    ),
  },
);
