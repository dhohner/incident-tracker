import { useEffect, useState } from "react";

const STORAGE_KEY = "incident_tracker_jira_account_id";
const QUERY_KEY = "jira_account_id";

export const useJiraAccountId = () => {
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get(QUERY_KEY);
    if (fromQuery) {
      window.localStorage.setItem(STORAGE_KEY, fromQuery);
      params.delete(QUERY_KEY);
      const nextUrl = `${window.location.pathname}${
        params.toString() ? `?${params.toString()}` : ""
      }${window.location.hash}`;
      window.history.replaceState({}, "", nextUrl);
      setAccountId(fromQuery);
      return;
    }

    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) {
      setAccountId(existing);
    }
  }, []);

  return accountId;
};
