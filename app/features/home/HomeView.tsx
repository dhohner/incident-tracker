import type { ChangeEvent } from "react";
import { Button, Chip, Input } from "@heroui/react";
import type { Ticket as TicketType, TicketStats, UpdateItem } from "./types";
import { formatTime, getPriorityColor, getStatusColor } from "./utils";
import { Muted } from "../../shared/ui/muted";
import { Panel } from "../../shared/ui/panel";
import { BrandCard } from "../../shared/layout/brand-card";
import { PageHeader } from "../../shared/layout/page-header";
import { PageShell } from "../../shared/layout/page-shell";
import { StatusStrip } from "../../shared/layout/status-strip";
import { Ticket } from "../../shared/layout/ticket";
import { TicketGrid } from "../../shared/layout/ticket-grid";
import { Timeline } from "../../shared/layout/timeline";
import { TrackActions } from "../../shared/layout/track-actions";
import { TrackRow } from "../../shared/layout/track-row";
import { TrackedTicket } from "../../shared/layout/tracked-ticket";

type HomeViewProps = {
  trackedKey: string;
  trackingMessage: string;
  isHydrated: boolean;
  jiraConnected: boolean;
  jiraSiteUrl: string | null;
  jiraProjectKey: string;
  jiraLastSyncAt: number | null;
  stats: TicketStats;
  trackedTicket: TicketType | null;
  ticketList: TicketType[];
  updatesList: UpdateItem[];
  onProjectKeyChange: (value: string) => void;
  onProjectKeySave: () => void;
  onTrackChange: (value: string) => void;
  onClearTracking: () => void;
};

export const HomeView = ({
  trackedKey,
  trackingMessage,
  isHydrated,
  jiraConnected,
  jiraSiteUrl,
  jiraProjectKey,
  jiraLastSyncAt,
  stats,
  trackedTicket,
  ticketList,
  updatesList,
  onProjectKeyChange,
  onProjectKeySave,
  onTrackChange,
  onClearTracking,
}: HomeViewProps) => {
  const jiraDisabled = isHydrated ? !jiraConnected : undefined;
  const projectKeySaveDisabled = isHydrated
    ? !jiraConnected || !jiraProjectKey.trim()
    : undefined;
  const jiraStatusText = jiraConnected
    ? `PAT configured${jiraSiteUrl ? ` · ${jiraSiteUrl}` : ""}`
    : "Configure JIRA_PAT_EMAIL, JIRA_PAT_TOKEN, and JIRA_SITE_URL to sync.";

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onTrackChange(event.target.value);
  };
  const handleProjectKeyInput = (event: ChangeEvent<HTMLInputElement>) => {
    onProjectKeyChange(event.target.value);
  };

  return (
    <PageShell>
      <PageHeader>
        <BrandCard>
          <BrandCard.Flag>
            <BrandCard.Dot />
            <span>JIRA pulse</span>
          </BrandCard.Flag>
          <BrandCard.Title>Incident Tracker</BrandCard.Title>
          <BrandCard.Subtitle>
            Live view of active incidents synced from your Jira projects.
          </BrandCard.Subtitle>
          <BrandCard.Meta>
            <span>Region: EU</span>
            <span>Latency: 94ms</span>
            <span>Feed: Live</span>
          </BrandCard.Meta>
        </BrandCard>
        <StatusStrip>
          <StatusStrip.Stat>
            <StatusStrip.Stat.Label>Open Incidents</StatusStrip.Stat.Label>
            <StatusStrip.Stat.Value>{stats.openCount}</StatusStrip.Stat.Value>
          </StatusStrip.Stat>
          <StatusStrip.Stat>
            <StatusStrip.Stat.Label>In Progress</StatusStrip.Stat.Label>
            <StatusStrip.Stat.Value>
              {stats.inProgressCount}
            </StatusStrip.Stat.Value>
          </StatusStrip.Stat>
          <StatusStrip.Stat>
            <StatusStrip.Stat.Label>Critical (P0/P1)</StatusStrip.Stat.Label>
            <StatusStrip.Stat.Value>
              {stats.criticalCount}
            </StatusStrip.Stat.Value>
          </StatusStrip.Stat>
        </StatusStrip>
      </PageHeader>

      <Panel>
        <div className="grid gap-4">
          <div className="grid items-center gap-3 rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(12,16,26,0.75)] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="grid gap-1">
                <span className="text-sm font-semibold tracking-[0.02em] text-[var(--fog-100)]">
                  Jira Connection
                </span>
                <Muted>{jiraStatusText}</Muted>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                aria-label="Project key"
                placeholder="Project key (e.g. INC)"
                value={jiraProjectKey}
                onChange={handleProjectKeyInput}
                className="max-w-[240px] [&_label]:text-[var(--fog-100)] [&_input]:bg-[rgba(8,10,16,0.65)] [&_input]:border-[rgba(255,255,255,0.12)] [&_input]:text-[rgba(14,18,28,0.92)] [&_input]:placeholder:text-[rgba(14,18,28,0.45)] [&_input]:focus:text-[rgba(14,18,28,0.98)]"
                disabled={jiraDisabled}
              />
              <Button
                variant="secondary"
                onPress={onProjectKeySave}
                isDisabled={projectKeySaveDisabled}
              >
                Save project
              </Button>
              {jiraLastSyncAt && (
                <Muted>Last sync: {formatTime(jiraLastSyncAt)}</Muted>
              )}
            </div>
          </div>
          <div className="grid items-center gap-3.5 px-4">
            <TrackRow>
              <Input
                aria-label="Track ticket"
                placeholder="INC-1042"
                value={trackedKey}
                onChange={handleInputChange}
                className="max-w-[240px] [&_label]:text-[var(--fog-100)] [&_input]:bg-[rgba(8,10,16,0.65)] [&_input]:border-[rgba(255,255,255,0.12)] [&_input]:text-[rgba(14,18,28,0.92)] [&_input]:placeholder:text-[rgba(14,18,28,0.45)] [&_input]:focus:text-[rgba(14,18,28,0.98)]"
              />
              <TrackActions>
                <Button
                  variant="secondary"
                  onPress={onClearTracking}
                  isDisabled={!trackedKey}
                  size="sm"
                >
                  Clear
                </Button>
                <Muted>{trackingMessage}</Muted>
              </TrackActions>
            </TrackRow>
          </div>
        </div>
      </Panel>

      <section className="grid gap-4 grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] max-[960px]:grid-cols-1">
        <Panel>
          <Panel.Title>Active Tickets</Panel.Title>
          {trackedTicket && (
            <TrackedTicket>
              <TrackedTicket.Header>
                <TrackedTicket.Key>{trackedTicket.key}</TrackedTicket.Key>
                <TrackedTicket.Badge>Tracking</TrackedTicket.Badge>
              </TrackedTicket.Header>
              <Ticket.Title>{trackedTicket.title}</Ticket.Title>
              <Ticket.Meta>
                <span>{trackedTicket.service}</span>
                <span>•</span>
                <span>{trackedTicket.assignee}</span>
              </Ticket.Meta>
              <Ticket.Meta>
                <Chip size="sm" color={getStatusColor(trackedTicket.status)}>
                  {trackedTicket.status}
                </Chip>
                <Chip
                  size="sm"
                  color={getPriorityColor(trackedTicket.priority)}
                >
                  {trackedTicket.priority}
                </Chip>
                <span>Updated {formatTime(trackedTicket.updatedAt)}</span>
              </Ticket.Meta>
              <Muted.Paragraph>{trackedTicket.summary}</Muted.Paragraph>
            </TrackedTicket>
          )}
          <TicketGrid>
            {ticketList.map((ticket) => (
              <Ticket
                key={ticket._id}
                tracked={trackedTicket?._id === ticket._id}
              >
                <Ticket.Key>{ticket.key}</Ticket.Key>
                <Ticket.Title>{ticket.title}</Ticket.Title>
                <Ticket.Meta>
                  <span>{ticket.service}</span>
                  <span>•</span>
                  <span>{ticket.assignee}</span>
                </Ticket.Meta>
                <Ticket.Meta>
                  <Chip size="sm" color={getStatusColor(ticket.status)}>
                    {ticket.status}
                  </Chip>
                  <Chip size="sm" color={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Chip>
                  <span>Updated {formatTime(ticket.updatedAt)}</span>
                </Ticket.Meta>
              </Ticket>
            ))}
          </TicketGrid>
        </Panel>

        <Panel>
          <Panel.Title>Latest Updates</Panel.Title>
          <Timeline>
            {updatesList.map((update) => (
              <Timeline.Item key={update._id}>
                <Timeline.Item.Header>
                  <span>{update.ticketKey}</span>
                  <span>{formatTime(update.createdAt)}</span>
                </Timeline.Item.Header>
                <Timeline.Item.Title>{update.ticketTitle}</Timeline.Item.Title>
                <Ticket.Meta>
                  <Chip size="sm" color={getStatusColor(update.status)}>
                    {update.status}
                  </Chip>
                  <Chip size="sm" color={getPriorityColor(update.priority)}>
                    {update.priority}
                  </Chip>
                  <span>{update.assignee}</span>
                </Ticket.Meta>
                <Muted.Paragraph>{update.message}</Muted.Paragraph>
              </Timeline.Item>
            ))}
          </Timeline>
        </Panel>
      </section>
    </PageShell>
  );
};
