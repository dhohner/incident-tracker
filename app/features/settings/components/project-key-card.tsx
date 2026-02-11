import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type ProjectKeyCardProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  projectKeySource?: string | null;
};

export function ProjectKeyCard({
  value,
  onChange,
  disabled = false,
  projectKeySource,
}: ProjectKeyCardProps) {
  return (
    <Card className="border-cyan-400/25 bg-slate-900/70">
      <CardHeader>
        <CardTitle>Jira Project Key</CardTitle>
        <CardDescription>Change the Jira project key.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <label
            htmlFor="project-key"
            className="text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase"
          >
            Project Key
          </label>
          <input
            id="project-key"
            name="projectKey"
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="INCIDENTS"
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 ring-cyan-400/50 transition outline-none focus:border-cyan-300 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
            autoComplete="off"
            spellCheck={false}
            disabled={disabled}
          />
          <p className="text-xs text-slate-400">
            Current source:{" "}
            <span className="text-slate-200">
              {projectKeySource ?? "loading"}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
