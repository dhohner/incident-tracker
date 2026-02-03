import type { ReactNode } from "react";

type PageHeaderProps = {
  children: ReactNode;
};

export const PageHeader = ({ children }: PageHeaderProps) => (
  <header className="grid items-center gap-6 [grid-template-columns:minmax(0,1.2fr)_minmax(0,1fr)] max-[960px]:grid-cols-1">
    {children}
  </header>
);
