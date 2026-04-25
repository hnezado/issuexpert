import { fetchCurrentUser } from "../auth/user.js";

async function hasAccess(route) {
  if (!route) return false;

  if (route.requireAuth === false) return true;

  const currentUser = await fetchCurrentUser();
  if (!currentUser) return false;

  if (!route.allowedRoles || route.allowedRoles.length === 0) {
    return true;
  }

  return route.allowedRoles.includes(currentUser.role_id);
}

export { hasAccess };
