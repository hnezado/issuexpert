import { fetchCurrentUser } from "../auth/user.js";
import { ROUTES } from "../config.js";
import { checkAccess } from "./guards.js";
import { logger } from "./logger.js";
import { render } from "./render.js";

/**
 * Navigates to a route by key.
 * Handles route validation, access control, history state, and view rendering.
 */
async function goTo(routeKey) {
  if (!routeKey) {
    logger.error("Router.goTo: no route key");
  }

  // (dev) Quitar cuando implemente la página de errores
  if (routeKey === "error") return;

  const routeConfig = ROUTES?.[routeKey];
  if (!routeConfig) {
    logger.error("Router.goTo: no route with that key", { routeKey });
    return goTo("error");
  }

  const currentUser = await fetchCurrentUser();

  if (!currentUser && routeConfig.requireAuth) {
    logger.warn("Router.goTo: auth required but no user");
    return goTo("login");
  }

  const accessResult = checkAccess(routeConfig, currentUser);

  if (!accessResult.ok) {
    // return goTo("error", accessResult.errorCode || ERROR_CODES.NOT_FOUND);
    logger.warn("Router.goTo: no access to route", {
      errorCode: accessResult.errorCode,
      routeKey,
    });
    return goTo("error");
  }

  logger.info(`Router.goTo: enrouting to: ${routeKey}`, {
    routeKey,
    routeConfig,
  });

  history.pushState({ route: routeKey }, "", routeConfig.url);

  render(routeConfig.views);
}

export { goTo };
