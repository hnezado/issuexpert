import { API_BASE_URL } from "../config.js";
import { logger } from "../core/logger.js";

let cachedUser = null;

async function fetchCurrentUser() {
  // Memory cache
  if (cachedUser) return cachedUser;

  // Session storage cache
  const storedUser = sessionStorage.getItem("current_user");
  if (storedUser) {
    cachedUser = JSON.parse(storedUser);
    return cachedUser;
  }

  // Backend user retrieving
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/user-info`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      logger.error("Error retrieving user data");
      return null;
    }

    const data = await res.json();

    cachedUser = data.user;
    sessionStorage.setItem("current_user", JSON.stringify(cachedUser));

    return cachedUser;
  } catch (err) {
    logger.error(err);
    return null;
  }
}

function clearCurrentUser() {
  cachedUser = null;
  sessionStorage.removeItem("current_user");
}

export { fetchCurrentUser, clearCurrentUser };
