import type { ReactNode } from "react";

type TrackActionsProps = {
  children: ReactNode;
};

export const TrackActions = ({ children }: TrackActionsProps) => (
  <div className="flex flex-wrap items-center gap-3">{children}</div>
);
