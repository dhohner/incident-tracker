import { useEffect, useState } from "react";
import * as Ariakit from "@ariakit/react";
import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";

import { api } from "../../../../convex/_generated/api";
import { normalizeTicketSeverity, type TicketSeverity } from "~/lib/tickets";
import { ProjectKeyCard } from "./project-key-card";
import { SeverityCard } from "./severity-card";

type PreferencesDialogProps = {
  store: Ariakit.DialogStore;
};

export function PreferencesDialog({ store }: PreferencesDialogProps) {
  const jiraStatus = useQuery(api.jira.getStatus);
  const open = Ariakit.useStoreState(store, "open");
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
      store.hide();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to update settings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <Ariakit.Dialog
          store={store}
          id="preferences-dialog"
          backdrop={
            <motion.div
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            />
          }
          render={
            <motion.div
              className="fixed top-1/2 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-800/80 bg-slate-900/95 text-slate-100 shadow-[0_0_50px_rgba(15,23,42,0.65)] outline-none"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            />
          }
        >
          <div className="space-y-1.5 px-6 pt-6 pb-5">
            <Ariakit.DialogHeading className="text-lg font-semibold tracking-tight text-slate-100">
              Settings
            </Ariakit.DialogHeading>
            <Ariakit.DialogDescription className="text-sm text-slate-400">
              Configure Jira project and incident severity preferences.
            </Ariakit.DialogDescription>
          </div>
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
              <p role="alert" className="text-sm text-rose-300">
                {errorMessage}
              </p>
            )}
            <div className="flex items-center justify-end gap-2">
              <Ariakit.DialogDismiss className="cursor-pointer rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500">
                Close
              </Ariakit.DialogDismiss>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className="cursor-pointer rounded-xl border border-cyan-300/40 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/80 hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800/50 disabled:text-slate-400"
              >
                {isSaving ? "Saving..." : "Save settings"}
              </button>
            </div>
          </div>
        </Ariakit.Dialog>
      ) : null}
    </AnimatePresence>
  );
}
