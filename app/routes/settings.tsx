import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Link } from "react-router";

import type { Route } from "./+types/settings";
import { api } from "../../convex/_generated/api";
import { PageShell } from "~/components/layout/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Settings - Incident Tracker" },
    {
      name: "description",
      content: "Configure Jira project settings.",
    },
  ];
}

export default function Settings() {
  const jiraStatus = useQuery(api.jira.getStatus);
  const projectKey = jiraStatus?.projectKey;
  const setProjectKey = useMutation(api.jira.setProjectKey);
  const [projectKeyInput, setProjectKeyInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [savedMessage, setSavedMessage] = useState<string>();

  useEffect(() => {
    if (projectKey !== undefined && projectKey !== null) {
      setProjectKeyInput(projectKey);
    }
  }, [projectKey]);

  const normalizedInput = projectKeyInput.trim().toUpperCase();

  const hasInput = normalizedInput.length > 0;
  const hasChanges = normalizedInput !== (projectKey ?? "");
  const canSave = !isSaving && hasInput && hasChanges;

  const handleSave = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!normalizedInput) {
      setErrorMessage("Project key is required.");
      setSavedMessage(undefined);
      return;
    }

    setIsSaving(true);
    setErrorMessage(undefined);
    setSavedMessage(undefined);

    try {
      await setProjectKey({ projectKey: normalizedInput });
      setProjectKeyInput(normalizedInput);
      setSavedMessage("Project key updated. The next sync will use this key.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to update project key.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageShell>
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="flex items-center justify-between gap-4">
          <h1
            className="text-3xl sm:text-4xl"
            style={{ fontFamily: '"Unbounded", sans-serif' }}
          >
            Settings
          </h1>
          <Link
            to="/"
            className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100 transition hover:border-cyan-300/70 hover:bg-cyan-500/20"
          >
            Back
          </Link>
        </div>

        <Card className="border-cyan-400/25 bg-slate-900/70">
          <CardHeader>
            <CardTitle>Jira Project Key</CardTitle>
            <CardDescription>Change the Jira project Key.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSave}>
              <div className="space-y-2">
                <label
                  htmlFor="project-key"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300"
                >
                  Project Key
                </label>
                <input
                  id="project-key"
                  name="projectKey"
                  type="text"
                  value={projectKeyInput}
                  onChange={(event) => setProjectKeyInput(event.target.value)}
                  placeholder="INCIDENTS"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400/50 transition focus:border-cyan-300 focus:ring-2"
                  autoComplete="off"
                  spellCheck={false}
                />
                <p className="text-xs text-slate-400">
                  Current source:{" "}
                  <span className="text-slate-200">
                    {jiraStatus?.projectKeySource ?? "loading"}
                  </span>
                </p>
              </div>

              {errorMessage && (
                <p className="text-sm text-rose-300">{errorMessage}</p>
              )}
              {savedMessage && (
                <p className="text-sm text-emerald-300">{savedMessage}</p>
              )}

              <button
                type="submit"
                disabled={!canSave}
                className="rounded-xl border border-cyan-300/40 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/80 hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800/50 disabled:text-slate-400"
              >
                {isSaving ? "Saving..." : "Save project key"}
              </button>
            </form>
          </CardContent>
        </Card>
      </main>
    </PageShell>
  );
}
