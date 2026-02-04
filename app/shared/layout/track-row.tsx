import type { ReactNode } from "react";

type TrackRowProps = {
  children: ReactNode;
};

export const TrackRow = ({ children }: TrackRowProps) => (
  <div className="grid items-center gap-3 [grid-template-columns:minmax(200px,240px)_minmax(0,1fr)] max-[960px]:grid-cols-1">
    {children}
  </div>
);
