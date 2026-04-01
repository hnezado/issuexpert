// Check authentication before loading protected pages

const auth_token = localStorage.getItem("auth_token");

if (!auth_token) {
  goTo(ROUTES.login);
}
