import type { ChangeEvent, CSSProperties } from "react";
import { Button, Chip, Input, Switch } from "@heroui/react";
import type { Ticket as TicketType, TicketStats, UpdateItem } from "./types";
import { formatTime, getPriorityColor, getStatusColor } from "./utils";
import { Muted } from "../ui/muted";
import { Panel } from "../ui/panel";
import { BrandCard } from "../layout/brand-card";
import { PageHeader } from "../layout/page-header";
import { PageShell } from "../layout/page-shell";
import { StatusStrip } from "../layout/status-strip";
import { Ticket } from "../layout/ticket";
import { TicketGrid } from "../layout/ticket-grid";
import { Timeline } from "../layout/timeline";
import { TrackActions } from "../layout/track-actions";
import { TrackRow } from "../layout/track-row";
import { TrackedTicket } from "../layout/tracked-ticket";

type HomeViewProps = {
  autoSync: boolean;
  trackedKey: string;
  trackingMessage: string;
  showConvexBanner: boolean;
  stats: TicketStats;
  trackedTicket: TicketType | null;
  ticketList: TicketType[];
  updatesList: UpdateItem[];
  onAutoSyncChange: (value: boolean) => void;
  onManualUpdate: () => void;
  onResetSeed: () => void;
  onTrackChange: (value: string) => void;
  onClearTracking: () => void;
};

export const HomeView = ({
  autoSync,
  trackedKey,
  trackingMessage,
  showConvexBanner,
  stats,
  trackedTicket,
  ticketList,
  updatesList,
  onAutoSyncChange,
  onManualUpdate,
  onResetSeed,
  onTrackChange,
  onClearTracking,
}: HomeViewProps) => {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onTrackChange(event.target.value);
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
            Live view of active incidents with optional mocked tickets updates
            every few seconds to mimic future JIRA sync.
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
          <div className="grid items-center [grid-template-columns:minmax(0,1fr)_auto] max-[900px]:grid-cols-1">
            <div className="grid items-center gap-3.5">
              <TrackRow>
                <Input
                  aria-label="Track ticket"
                  placeholder="INC-1042"
                  value={trackedKey}
                  onChange={handleInputChange}
                  className="text-[var(--fog-100)] [&_label]:text-[var(--fog-100)] [&_input]:bg-[rgba(8,10,16,0.65)] [&_input]:border-[rgba(255,255,255,0.12)]"
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
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" onPress={onManualUpdate}>
                  Pull update now
                </Button>
                <Button variant="secondary" onPress={onResetSeed}>
                  Reset mock data
                </Button>
              </div>
            </div>
            <div className="flex self-stretch flex-col items-end justify-center gap-2 border-l border-[rgba(255,255,255,0.08)] pl-3 max-[900px]:self-auto max-[900px]:items-start max-[900px]:justify-start max-[900px]:border-l-0 max-[900px]:pl-0">
              <Switch
                isSelected={autoSync}
                onChange={onAutoSyncChange}
                size="lg"
                className="group flex items-center gap-3.5"
                style={
                  {
                    "--switch-control-bg": "rgba(10, 12, 20, 0.75)",
                    "--switch-control-bg-hover": "rgba(18, 22, 32, 0.8)",
                    "--switch-control-bg-checked": "rgba(255, 156, 82, 0.95)",
                    "--switch-control-bg-checked-hover":
                      "rgba(255, 181, 112, 0.95)",
                  } as CSSProperties
                }
              >
                <Switch.Control className="border border-[rgba(255,255,255,0.2)] shadow-[inset_0_0_0_1px_rgba(8,10,18,0.45),0_12px_22px_rgba(4,8,18,0.4)] group-data-[selected=true]:border-[rgba(255,175,102,0.6)] group-data-[selected=true]:shadow-[inset_0_0_0_1px_rgba(255,175,102,0.35),0_12px_24px_rgba(4,8,18,0.45)]">
                  <Switch.Thumb />
                </Switch.Control>
                <span className="font-semibold tracking-[0.01em] text-[var(--fog-100)]">
                  Auto-sync mock updates
                </span>
              </Switch>
              <Muted>Stream status: {autoSync ? "Live" : "Paused"}</Muted>
            </div>
          </div>
          {showConvexBanner && (
            <div className="rounded-[14px] border border-dashed border-[rgba(255,138,61,0.5)] bg-[rgba(12,15,24,0.85)] px-4 py-3 text-[0.9rem] text-[var(--fog-100)]">
              Set `VITE_CONVEX_URL` to connect to Convex. Until then, mock
              updates will not persist.
            </div>
          )}
        </div>
      </Panel>

      <section className="grid gap-7 [grid-template-columns:minmax(0,1.6fr)_minmax(0,1fr)] max-[960px]:grid-cols-1">
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

export type { HomeViewProps };
