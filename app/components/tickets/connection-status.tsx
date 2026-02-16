"use client";

import { useEffect, useState, type HTMLAttributes } from "react";
import { useConvexConnectionState } from "convex/react";

import { Card } from "~/components/ui/card";
import { cn } from "~/utils/cn";

const connectionCardClassName =
  "border-cyan-400/20 bg-slate-900/60 p-4 text-right shadow-[0_0_40px_rgba(34,211,238,0.12)]";
const minimumSkeletonDurationMs = 300;

interface ConnectionStatusCardProps extends HTMLAttributes<HTMLDivElement> {}

function ConnectionStatusCard({
  className,
  ...props
}: ConnectionStatusCardProps) {
  return <Card className={cn(connectionCardClassName, className)} {...props} />;
}

function ConnectionStatusLabel() {
  return (
    <p className="text-xs text-slate-400 uppercase">Convex live updates</p>
  );
}

interface ConnectionStatusValueProps extends HTMLAttributes<HTMLParagraphElement> {}

function ConnectionStatusValue({
  className,
  ...props
}: ConnectionStatusValueProps) {
  return (
    <p
      aria-live="polite"
      className={cn("mt-2 text-lg transition-colors duration-300", className)}
      {...props}
    />
  );
}

export function ConnectionStatus() {
  const [isReady, setIsReady] = useState(false);
  const connectionState = useConvexConnectionState();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsReady(true);
    }, minimumSkeletonDurationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const isConnected = connectionState.isWebSocketConnected;
  const hasEverConnected = connectionState.hasEverConnected;
  let connectionLabel = "Connecting...";
  if (isConnected) {
    connectionLabel = "Connected";
  } else if (hasEverConnected) {
    connectionLabel = "Reconnecting...";
  }

  if (!isReady) {
    return (
      <ConnectionStatusCard
        aria-busy="true"
        aria-live="polite"
        aria-label="Convex live updates loading"
      >
        <ConnectionStatusLabel />
        <ConnectionStatusValue className="animate-pulse text-amber-200/90">
          Reconnecting...
        </ConnectionStatusValue>
        <div className="sr-only">Reconnecting...</div>
      </ConnectionStatusCard>
    );
  }

  return (
    <ConnectionStatusCard
      aria-busy="false"
      aria-label="Convex live updates status"
    >
      <ConnectionStatusLabel />
      <ConnectionStatusValue
        className={isConnected ? "text-emerald-200" : "text-amber-200"}
      >
        {connectionLabel}
      </ConnectionStatusValue>
    </ConnectionStatusCard>
  );
}
