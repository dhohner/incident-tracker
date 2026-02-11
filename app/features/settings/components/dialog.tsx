import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { normalizeTicketSeverity, type TicketSeverity } from "~/lib/tickets";
import { ProjectKeyCard } from "./project-key-card";
import { SeverityCard } from "./severity-card";

type PreferencesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PreferencesDialog({
  open,
  onOpenChange,
}: PreferencesDialogProps) {
  const jiraStatus = useQuery(api.jira.getStatus);
  const setProjectKey = useMutation(api.jira.setProjectKey);
  const setTicketSeverity = useMutation(api.jira.setTicketSeverity);
  const configuredTicketSeverity = normalizeTicketSeverity(
    jiraStatus?.ticketSeverity,
  );
  const [projectKeyInput, setProjectKeyInput] = useState("");
  const [severityInput, setSeverityInput] = useState<TicketSeverity>("P1");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    if (!open) return;

    setProjectKeyInput(jiraStatus?.projectKey ?? "");
    setSeverityInput(configuredTicketSeverity);
    setErrorMessage(undefined);
  }, [configuredTicketSeverity, jiraStatus?.projectKey, open]);

  const normalizedProjectKeyInput = projectKeyInput.trim().toUpperCase();
  const currentProjectKey = jiraStatus?.projectKey ?? "";
  const projectKeyChanged = normalizedProjectKeyInput !== currentProjectKey;
  const severityChanged = severityInput !== configuredTicketSeverity;
  const hasChanges = projectKeyChanged || severityChanged;
  const hasValidProjectKey = normalizedProjectKeyInput.length > 0;
  const canSave = !isSaving && hasChanges && hasValidProjectKey;

  const handleSave = async () => {
    if (!hasValidProjectKey) {
      setErrorMessage("Project key is required.");
      return;
    }

    if (!hasChanges) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(undefined);

    try {
      if (projectKeyChanged) {
        await setProjectKey({ projectKey: normalizedProjectKeyInput });
      }
      if (severityChanged) {
        await setTicketSeverity({ severity: severityInput });
      }

      setProjectKeyInput(normalizedProjectKeyInput);
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update settings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-5">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure Jira project and incident severity preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-6 pb-6">
          <ProjectKeyCard
            value={projectKeyInput}
            onChange={setProjectKeyInput}
            disabled={isSaving}
            projectKeySource={jiraStatus?.projectKeySource}
          />
          <SeverityCard
            value={severityInput}
            onChange={setSeverityInput}
            disabled={isSaving}
          />
          {errorMessage && (
            <p className="text-sm text-rose-300">{errorMessage}</p>
          )}
          <DialogFooter>
            <DialogClose className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500">
              Close
            </DialogClose>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="rounded-xl border border-cyan-300/40 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/80 hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800/50 disabled:text-slate-400"
            >
              {isSaving ? "Saving..." : "Save settings"}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
