function logout() {
  localStorage.removeItem("auth_token");
  goTo(ROUTES.login);
}

logout();
