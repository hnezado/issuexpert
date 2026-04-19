function logout() {
  localStorage.removeItem("auth_token");
  goTo(ROUTES.login);
}

document.querySelector(".btn-logout").addEventListener("click", logout);
