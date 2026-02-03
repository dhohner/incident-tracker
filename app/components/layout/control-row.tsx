import type { ReactNode } from "react";

type ControlRowProps = {
  children: ReactNode;
};

export const ControlRow = ({ children }: ControlRowProps) => (
  <div className="flex flex-wrap items-center gap-3">{children}</div>
);
