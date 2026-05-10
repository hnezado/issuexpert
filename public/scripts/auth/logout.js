import { clearCurrentUser } from "./user.js";
import { goTo } from "../core/router.js";

function logout() {
  clearCurrentUser();
  goTo("login");
}

export { logout };
