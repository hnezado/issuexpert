import { fetchCurrentUser } from "../auth/user.js";
import { ERROR_CODES } from "../config.js";

/**
 * Checks route access (auth + roles).
 * Returns { ok, [errorCode] }.
 */
async function checkAccess(routeConfig) {
  if (!routeConfig) {
    return { ok: false, errorCode: ERROR_CODES.NOT_FOUND };
  }

  if (routeConfig.requireAuth === false) {
    return { ok: true };
  }

  const currentUser = await fetchCurrentUser();
  if (!currentUser) {
    return { ok: false, errorCode: ERROR_CODES.NOT_AUTHENTICATED };
  }

  if (!routeConfig.allowedRoles || routeConfig.allowedRoles.length === 0) {
    return { ok: true };
  }

  if (!routeConfig.allowedRoles.includes(currentUser.role_id)) {
    return { ok: false, errorCode: ERROR_CODES.NO_PERMISSIONS };
  }

  return { ok: true };
}

export { checkAccess };
