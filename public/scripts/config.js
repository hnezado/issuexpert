// Works in dev and prod
const ENV = "dev";
const API_BASE_URL = window.location.origin + "/api";

const ERROR_CODES = {
  NOT_FOUND: "NOT_FOUND",
  NOT_AUTHENTICATED: "NOT_AUTHENTICATED",
  NO_PERMISSIONS: "NO_PERMISSIONS",
};

// Base path for all frontend pages and its allowed roles
const ROUTES = {
  index: {
    url: "/",
    requireAuth: false,
  },
  error: {
    url: "/error",
    requireAuth: false,
    views: ["error"],
  },
  login: {
    url: "/login",
    requireAuth: false,
    views: ["login"],
  },
  logout: {
    url: "/logout",
    requireAuth: true,
  },
  dashboard: {
    url: "/dashboard",
    requireAuth: true,
    // views: ["header", "tickets-table", "footer"],
    views: ["header", "dashboard"],
  },
  "admin-panel": {
    url: "/admin-panel",
    requireAuth: true,
    allowedRoles: [1],
    views: ["header", "admin-panel"],
  },
};

export { ENV, API_BASE_URL, ERROR_CODES, ROUTES };
