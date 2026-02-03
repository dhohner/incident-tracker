import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
};

export const PageShell = ({ children }: PageShellProps) => (
  <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col gap-9 px-6 pb-24 pt-14 max-[960px]:px-[18px] max-[960px]:pb-[72px] max-[960px]:pt-10">
    {children}
  </div>
);
