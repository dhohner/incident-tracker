import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Outlet } from "react-router";

import { env } from "~/config/env";

const convexClient = new ConvexReactClient(env.convexUrl);

export function App() {
  return (
    <ConvexProvider client={convexClient}>
      <Outlet />
    </ConvexProvider>
  );
}
