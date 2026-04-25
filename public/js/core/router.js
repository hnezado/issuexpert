import { ERROR_CODES, ROUTES } from "../config.js";
import { checkAccess } from "./guards.js";

async function goTo(routeKey) {
  const routeConfig = ROUTES[routeKey];
  if (!routeConfig) return redirectToErrorPage(ERROR_CODES.NOT_FOUND);

  const accessResult = await checkAccess(routeConfig);
  if (!accessResult.ok)
    return redirectToErrorPage(accessResult.errorCode || ERROR_CODES.NOT_FOUND);

  window.location.href = routeConfig.path;
}

function redirectToErrorPage(errorCode) {
  window.location.href = `/error-page.html?type=${errorCode}`;
}

export { goTo };
