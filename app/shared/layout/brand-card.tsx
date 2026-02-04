import type { ReactNode } from "react";

type BrandCardProps = {
  children: ReactNode;
};

export const BrandCard = Object.assign(
  ({ children }: BrandCardProps) => (
    <div className="rounded-[32px] border border-[rgba(54,214,194,0.25)] bg-[linear-gradient(135deg,rgba(54,214,194,0.08)_0%,transparent_60%),var(--panel-strong)] px-[30px] py-7 shadow-[var(--shadow)] backdrop-blur-[18px] animate-[rise-in_0.7s_ease_both] motion-reduce:animate-none">
      {children}
    </div>
  ),
  {
    Flag: ({ children }: BrandCardProps) => (
      <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(8,10,16,0.7)] px-3 py-1.5 text-[0.78rem] uppercase tracking-[0.08em] text-[var(--fog-200)]">
        {children}
      </div>
    ),
    Dot: () => (
      <span className="h-2 w-2 rounded-full bg-[var(--accent-2)] shadow-[0_0_12px_rgba(54,214,194,0.9)]" />
    ),
    Title: ({ children }: BrandCardProps) => (
      <h1 className="m-0 mb-2.5 font-[var(--font-display)] text-[clamp(2.6rem,4vw,3.4rem)] tracking-[-0.02em]">
        {children}
      </h1>
    ),
    Subtitle: ({ children }: BrandCardProps) => (
      <p className="m-0 max-w-[42ch] text-[1.05rem] text-[var(--ink-700)]">
        {children}
      </p>
    ),
    Meta: ({ children }: BrandCardProps) => (
      <div className="mt-5 flex flex-wrap gap-x-[18px] gap-y-2.5 text-[0.88rem] text-[var(--ink-500)]">
        {children}
      </div>
    ),
  },
);
