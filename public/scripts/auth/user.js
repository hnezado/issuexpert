import { API_BASE_URL } from "../config.js";
import { logger } from "../core/logger.js";

let cachedUser = null;

async function fetchCurrentUser() {
  // Memory cache
  if (cachedUser) return cachedUser;

  // Session storage cache
  const storedUser = sessionStorage.getItem("current_user");
  if (storedUser) {
    try {
      cachedUser = JSON.parse(storedUser);
      return cachedUser;
    } catch {
      clearCurrentUser();
    }
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
      const error = await res.json();
      logger.error("User.fetchCurrentUser: server error", {
        status: res.status,
        message: error.message,
      });
      clearCurrentUser();
      return null;
    }

    const data = await res.json();

    cachedUser = data.user;
    sessionStorage.setItem("current_user", JSON.stringify(cachedUser));

    return cachedUser;
  } catch (error) {
    logger.error("User.fetchCurrentUser: error fetching user", {
      error,
    });
    return null;
  }
}

function clearCurrentUser() {
  cachedUser = null;
  sessionStorage.removeItem("current_user");
  localStorage.removeItem("auth_token");
}

export { fetchCurrentUser, clearCurrentUser };
