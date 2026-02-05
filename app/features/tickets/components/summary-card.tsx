import { Card } from "~/components/ui/card";

interface SummaryCardProps {
  label: string;
  value: number;
}

export function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <Card className="border-cyan-400/20 bg-slate-900/60 px-4 py-5">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">
        {label}
      </p>
      <p className="mt-3 text-3xl text-cyan-100">{value}</p>
    </Card>
  );
}
