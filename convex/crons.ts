import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// crons.interval("jira-sync", { minutes: 1 }, internal.jira.syncAll);

export default crons;
