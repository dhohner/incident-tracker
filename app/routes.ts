import { type RouteConfig, index } from "@react-router/dev/routes";
import { routeModules } from "./router";

export default [index(routeModules.home)] satisfies RouteConfig;
