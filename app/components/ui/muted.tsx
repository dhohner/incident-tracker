import type { ReactNode } from "react";

type MutedProps = {
  children: ReactNode;
};

export const Muted = Object.assign(
  ({ children }: MutedProps) => (
    <span className="text-[0.9rem] text-[var(--ink-500)]">{children}</span>
  ),
  {
    Paragraph: ({ children }: MutedProps) => (
      <p className="m-0 text-[0.9rem] text-[var(--ink-500)]">{children}</p>
    ),
  },
);
