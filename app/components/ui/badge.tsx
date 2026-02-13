import * as React from "react";

import { cn } from "~/utils/cn";

type BadgeVariant = "default" | "muted" | "accent";

const badgeStyles: Record<BadgeVariant, string> = {
  default: "border-slate-700 text-slate-200",
  muted: "border-slate-700 text-slate-400",
  accent: "border-cyan-400/30 text-cyan-200",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs tracking-[0.2em] uppercase",
        badgeStyles[variant],
        className,
      )}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";

export { Badge };
