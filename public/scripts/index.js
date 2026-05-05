import { API_BASE_URL, ROUTES } from "./config.js";
import { logger } from "./core/logger.js";
import { goTo } from "./core/router.js";

// Index redirections
async function init() {
  await loadModal();

  const authToken = localStorage.getItem("auth_token");

  if (!authToken) {
    // No authentication token > go login
    goTo("login");
    return;
  }

  // User is authenticated > verify token with backend
  const isValidAuth = await verifyAuthToken(authToken);
  if (isValidAuth === false) return;

  // Token is correct > redirect to current page
  const initialRoute = resolveInitialRoute();
  goTo(initialRoute);
}

// Load global modal once
async function loadModal() {
  const res = await fetch("/views/modal.view.html");
  const html = await res.text();

  document.getElementById("modal").innerHTML = html;

  // Import modal container AFTER injecting HTML
  const ModalController = (await import("./controllers/modal.controller.js"))
    .default;
  const modalInstance = ModalController.getInstance();
  const modalRoot = document.querySelector("#modal");
  modalInstance.init(modalRoot);
}

async function verifyAuthToken(authToken) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: {
        Authorization: "Bearer " + authToken,
      },
    });

    // Invalid or expired token
    if (res.status === 401) {
      localStorage.removeItem("auth_token");
      goTo("login");
      return false;
    }

    // Undefined error
    if (!res.ok) {
      logger.error("VerifyAuthToken: unexpected response", {
        status: res.status,
      });
      return false;
    }

    return true;
  } catch (err) {
    logger.error("VerifyAuthToken: error validating token: ", { err });
    localStorage.removeItem("auth_token");
    goTo("login");
    return false;
  }
}

function resolveInitialRoute() {
  const path = window.location.pathname;

  const match = Object.entries(ROUTES).find(([, route]) => route.url === path);

  return match ? match[0] : "dashboard";
}

init();
