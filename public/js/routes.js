// Base path for all frontend pages
const ROUTES = {
  index: "/index.html",
  login: "/login.html",
  logout: "/logout.html",
  dashboard: "/dashboard.html",
};

function goTo(route) {
  window.location.href = route;
}
