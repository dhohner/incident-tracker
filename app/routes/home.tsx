import type { Route } from "./+types/home";
import { HomeView, useHomeState } from "../components/home";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Incident Tracker - Live JIRA Pulse" },
    {
      name: "description",
      content:
        "Live incident tracking console with Convex updates and HeroUI styling.",
    },
  ];
}

export default function Home() {
  const state = useHomeState();
  return <HomeView {...state} />;
}
