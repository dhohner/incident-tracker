import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MOCK_TICKETS = [
  {
    key: "INC-1423",
    title: "Payments API returning intermittent 502s",
    status: "In Progress",
    priority: "P1",
    assignee: "A. Okafor",
    service: "payments-gateway",
    summary:
      "Investigate elevated 502s from edge, likely cache stampede on auth handshake.",
  },
  {
    key: "INC-1424",
    title: "EU dashboard latency spike",
    status: "Monitoring",
    priority: "P2",
    assignee: "J. Chen",
    service: "analytics-ui",
    summary:
      "Latency in EU zone after ingestion deploy, rollback in progress.",
  },
  {
    key: "INC-1425",
    title: "Customer export jobs stuck",
    status: "Open",
    priority: "P0",
    assignee: "S. Patel",
    service: "batch-orchestrator",
    summary:
      "Queue backlog growing; suspect Redis eviction causing job retries.",
  },
  {
    key: "INC-1426",
    title: "On-call alerts missing in Slack",
    status: "Needs Review",
    priority: "P2",
    assignee: "M. Torres",
    service: "alert-dispatcher",
    summary:
      "Slack webhook auth failure flagged in logs, investigating.",
  },
  {
    key: "INC-1427",
    title: "Mobile login MFA tokens delayed",
    status: "Awaiting Vendor",
    priority: "P1",
    assignee: "R. Singh",
    service: "identity-core",
    summary:
      "SMS provider reporting carrier degradation; awaiting fix ETA.",
  },
  {
    key: "INC-1428",
    title: "Search cluster shard imbalance",
    status: "Open",
    priority: "P3",
    assignee: "L. Hernandez",
    service: "search-index",
    summary:
      "Shard imbalance causing slow queries, planning reallocation.",
  },
];

const STATUSES = [
  "Open",
  "In Progress",
  "Needs Review",
  "Awaiting Vendor",
  "Monitoring",
  "Resolved",
  "Blocked",
];

const PRIORITIES = ["P0", "P1", "P2", "P3"];

const ASSIGNEES = [
  "A. Okafor",
  "J. Chen",
  "S. Patel",
  "M. Torres",
  "R. Singh",
  "L. Hernandez",
  "K. Alvarez",
  "I. Brooks",
];

const UPDATE_MESSAGES = [
  "Escalated to incident commander, triage notes updated.",
  "Rolled back latest deploy; monitoring for error rate improvement.",
  "Applied mitigation runbook step 3, awaiting metrics confirmation.",
  "Vendor engaged, shared logs and timeline for analysis.",
  "New synthetic checks added to track recovery progress.",
  "Reassigned to infra team for deeper network tracing.",
];

const randomPick = <T,>(items: T[]) =>
  items[Math.floor(Math.random() * items.length)];

const ensureSeeded = async (ctx: { db: any }) => {
  const existing = await ctx.db.query("tickets").first();
  if (existing) return;

  const now = Date.now();
  for (const ticket of MOCK_TICKETS) {
    const ticketId = await ctx.db.insert("tickets", {
      ...ticket,
      updatedAt: now,
    });
    await ctx.db.insert("updates", {
      ticketId,
      ticketKey: ticket.key,
      ticketTitle: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      assignee: ticket.assignee,
      message: "Ticket synced from JIRA mock feed.",
      createdAt: now,
    });
  }
};

export const list = query(async (ctx) => {
  return ctx.db.query("tickets").withIndex("by_updatedAt").order("desc").collect();
});

export const recentUpdates = query({
  args: { limit: v.number() },
  handler: async (ctx, { limit }) => {
    return ctx.db
      .query("updates")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
  },
});

export const seed = mutation({
  args: { reset: v.optional(v.boolean()) },
  handler: async (ctx, { reset }) => {
    if (reset) {
      const existingTickets = await ctx.db.query("tickets").collect();
      for (const ticket of existingTickets) {
        await ctx.db.delete(ticket._id);
      }
      const existingUpdates = await ctx.db.query("updates").collect();
      for (const update of existingUpdates) {
        await ctx.db.delete(update._id);
      }
    }

    await ensureSeeded(ctx);
  },
});

export const simulateUpdate = mutation(async (ctx) => {
  await ensureSeeded(ctx);
  const tickets = await ctx.db.query("tickets").collect();
  if (!tickets.length) return;

  const ticket = randomPick(tickets);
  const nextStatus =
    Math.random() > 0.45 ? randomPick(STATUSES) : ticket.status;
  const nextPriority =
    Math.random() > 0.65 ? randomPick(PRIORITIES) : ticket.priority;
  const nextAssignee =
    Math.random() > 0.6 ? randomPick(ASSIGNEES) : ticket.assignee;
  const updatedAt = Date.now();

  await ctx.db.patch(ticket._id, {
    status: nextStatus,
    priority: nextPriority,
    assignee: nextAssignee,
    updatedAt,
  });

  await ctx.db.insert("updates", {
    ticketId: ticket._id,
    ticketKey: ticket.key,
    ticketTitle: ticket.title,
    status: nextStatus,
    priority: nextPriority,
    assignee: nextAssignee,
    message: randomPick(UPDATE_MESSAGES),
    createdAt: updatedAt,
  });
});
