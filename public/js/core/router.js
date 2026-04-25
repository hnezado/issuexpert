import { ROUTES } from "../config.js";
import { hasAccess } from "./guards.js";

async function goTo(routeKey) {
  const route = ROUTES[routeKey];
  if (!route) return;

  if (!(await hasAccess(route))) return;

  window.location.href = route.path;
}

export { goTo };
