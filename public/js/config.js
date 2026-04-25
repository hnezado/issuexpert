// Works in dev and prod
const API_BASE_URL = window.location.origin + "/api";

const ROLES = {
  1: "admin",
  2: "technician",
  3: "user",
};

// Base path for all frontend pages and its allowed roles
const ROUTES = {
  index: {
    path: "/index.html",
    requireAuth: false,
  },
  login: {
    path: "/login.html",
    requireAuth: false,
  },
  logout: {
    path: "/logout.html",
    requireAuth: true,
  },
  dashboard: {
    path: "/dashboard.html",
    requireAuth: true,
  },
  adminPage: {
    path: "/admin-page.html",
    requireAuth: true,
    allowedRoles: [1],
  },
};

export const ERROR_CODES = {
  NOT_FOUND: "NOT_FOUND",
  NOT_AUTHENTICATED: "NOT_AUTHENTICATED",
  NO_PERMISSIONS: "NO_PERMISSIONS",
};

export { API_BASE_URL, ROLES, ROUTES };
