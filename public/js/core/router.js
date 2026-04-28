import { ROUTES } from "../config.js";
import { checkAccess } from "./guards.js";
import { logger } from "./logger.js";
import { render } from "./render.js";

/**
 * Navigates to a route by key.
 * Handles route validation, access control, history state, and view rendering.
 */
async function goTo(routeKey) {
  const routeConfig = ROUTES[routeKey];
  if (!routeConfig) {
    if (routeKey === "error") {
      logger.error("Critical: error route is missing.");
      return;
    }
    logger.error("Route is not defined.", { route: routeKey });

    if (!ROUTES.error) {
      logger.error("Error route is not defined.");
      return;
    }

    return goTo("error");
  }

  const accessResult = await checkAccess(routeConfig);

  if (!accessResult.ok) {
    // return goTo("error", accessResult.errorCode || ERROR_CODES.NOT_FOUND);
    logger.warn("Access to route invalid.", {
      errorCode: accessResult.errorCode,
      route: routeKey,
    });
    return goTo("error");
  }

  history.pushState({ route: routeKey }, "", routeConfig.url);

  render(routeConfig.views);
}

export { goTo };
