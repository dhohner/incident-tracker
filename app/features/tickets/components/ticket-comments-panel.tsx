import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  formatCommentTimestamp,
  type TicketComment,
} from "~/lib/ticket-comments";
import type { Ticket } from "~/lib/tickets";

interface TicketCommentsPanelProps {
  ticket?: Ticket;
  comments: TicketComment[];
  isLoading: boolean;
}

export function TicketCommentsPanel({
  ticket,
  comments,
  isLoading,
}: TicketCommentsPanelProps) {
  const previousCount = useRef(comments.length);
  const shouldAnimateGrowth = comments.length > previousCount.current;
  const hasComments = comments.length > 0;
  const showAllCommentsMessage = !ticket;
  const emptyMessage = ticket
    ? "No comments on this ticket."
    : "No comments available.";

  useEffect(() => {
    previousCount.current = comments.length;
  }, [comments.length]);

  return (
    <Card className="h-full border-cyan-900/40 bg-slate-950/50">
      <CardHeader className="border-b border-slate-800/60">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">
              Ticket Commentary
            </p>
            <CardTitle>Comments</CardTitle>
          </div>
          {ticket && (
            <Badge variant="accent" className="normal-case tracking-normal">
              {ticket.key}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-5">
        {showAllCommentsMessage && (
          <p className="text-sm text-slate-400">
            Showing all comments sorted by latest update.
          </p>
        )}
        {isLoading && (
          <p className="text-sm text-slate-400">Loading comments...</p>
        )}
        {!isLoading && !hasComments && (
          <p className="text-sm text-slate-400">{emptyMessage}</p>
        )}
        {!isLoading && hasComments && (
          <div className="max-h-152 space-y-3 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {comments.map((comment) => (
                <motion.article
                  key={comment._id}
                  layout
                  initial={
                    shouldAnimateGrowth
                      ? { opacity: 0, y: 12, scale: 0.98 }
                      : false
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                      {comment.author}
                    </p>
                    <div className="flex items-center gap-2">
                      {!ticket && (
                        <Badge
                          variant="accent"
                          className="normal-case tracking-normal"
                        >
                          {comment.ticketKey}
                        </Badge>
                      )}
                      <Badge
                        variant="muted"
                        className="normal-case tracking-normal"
                      >
                        {formatCommentTimestamp(comment.updatedAt)}
                      </Badge>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300/90">
                    {comment.body || "No comment body"}
                  </p>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
