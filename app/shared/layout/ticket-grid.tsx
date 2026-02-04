import type { ReactNode } from "react";

type TicketGridProps = {
  children: ReactNode;
};

export const TicketGrid = ({ children }: TicketGridProps) => (
  <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
    {children}
  </div>
);
