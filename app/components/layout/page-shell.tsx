import type { ReactNode } from "react";

import { cn } from "~/lib/utils";

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden bg-slate-950 text-slate-100",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.3),rgba(14,116,144,0.05),transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-52 right-[-120px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.25),rgba(190,24,93,0.06),transparent_70%)] blur-3xl" />
        <div className="absolute left-1/2 top-20 h-[360px] w-[360px] -translate-x-1/2 rounded-full border border-cyan-400/20" />
        <div className="absolute left-1/2 top-24 h-[280px] w-[280px] -translate-x-1/2 rounded-full border border-cyan-400/10" />
      </div>
      {children}
    </div>
  );
}
