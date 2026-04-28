// Works in dev and prod
const ENV = "development";
const API_BASE_URL = window.location.origin + "/api";

const ROLES = {
  1: "admin",
  2: "technician",
  3: "user",
};

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
    views: ["dashboard"],
  },
  adminPage: {
    url: "/admin-page",
    requireAuth: true,
    allowedRoles: [1],
  },
};

export { ENV, API_BASE_URL, ROLES, ERROR_CODES, ROUTES };
