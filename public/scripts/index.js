import { API_BASE_URL } from "./config.js";
import { logger } from "./core/logger.js";
import { goTo } from "./core/router.js";

// Index redirections
async function init() {
  const authToken = localStorage.getItem("auth_token");

  if (!authToken) {
    // No authentication token > go login
    goTo("login");
  } else {
    // User is authenticated > verify token with backend
    await verifyAuthToken(authToken);
  }
}

async function verifyAuthToken(authToken) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: {
        Authorization: "Bearer " + authToken,
      },
    });

    if (!res.ok) {
      // Invalid or expired token
      localStorage.removeItem("auth_token");
      goTo("login");
      return;
    }

    // Token is valid
    goTo("dashboard");
  } catch (err) {
    logger.error("[index.js|verifyAuthToken] Error validating token: ", {
      error: err,
    });
    // goTo("login");
  }
}

init();
