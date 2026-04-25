import { goTo } from "./core/router.js";

// Index redirections
function init() {
  const authToken = localStorage.getItem("auth_token");

  if (!authToken) {
    // No authentication token > go login
    goTo("login");
  } else {
    // User is authenticated > verify token with backend
    verifyAuthToken(authToken);
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
    console.error(err);
    goTo("login");
  }
}

init();
