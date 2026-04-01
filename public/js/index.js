// Index redirections
function init() {
  const auth_token = localStorage.getItem("auth_token");

  if (auth_token) {
    // User is authenticated > go dashboard
    goTo(ROUTES.dashboard);
  } else {
    // No authentication token > go login
    goTo(ROUTES.login);
  }
}

init();
