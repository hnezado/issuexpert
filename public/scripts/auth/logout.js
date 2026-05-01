import { clearCurrentUser } from "./user.js";
import { goTo } from "../core/router.js";

function logout() {
  clearCurrentUser();
  localStorage.removeItem("auth_token");
  goTo("login");
}

export { logout };
