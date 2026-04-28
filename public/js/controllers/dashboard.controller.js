import { goTo } from "../core/router.js";
import { fetchCurrentUser } from "../auth/user.js";
import { logout } from "../auth/logout.js";
import { ROLES } from "../config.js";

/**
 * Dashboard controller (singleton)
 * Handles user data, UI rendering and interactions.
 */
class DashboardController {
  static instance = null;

  // Singleton getter
  static getInstance() {
    if (!DashboardController.instance) {
      DashboardController.instance = new DashboardController();
    }
    return DashboardController.instance;
  }

  constructor() {
    if (DashboardController.instance) return DashboardController.instance;

    this.currentUser = null;
    this.adminPageBtn = null;
    this.logoutBtn = null;
    this.errorBtn = null;

    this.isInitialized = false;

    // Event listener handlers (used for removeEventListener in destroy)
    this.onAdminPageBtnClick = () => goTo("adminPage");
    this.onLogoutClick = () => logout();
    this.onErrorBtnClick = () => goTo("error");

    DashboardController.instance = this;
  }

  async init(rootElem) {
    if (this.isInitialized) this.destroy();

    this.rootElem = rootElem;

    await this.loadUser();
    this.bindEvents();
    this.renderUser();

    this.isInitialized = true;
  }

  bindEvents() {
    if (!this.rootElem) return;

    this.adminPageBtn = this.rootElem.querySelector("#btn-admin-page");
    this.logoutBtn = this.rootElem.querySelector("#btn-logout");
    this.errorBtn = this.rootElem.querySelector("#btn-force-error");

    this.adminPageBtn?.addEventListener("click", this.onAdminPageBtnClick);
    this.logoutBtn?.addEventListener("click", this.onLogoutClick);
    this.errorBtn?.addEventListener("click", this.onErrorBtnClick);
  }

  async loadUser() {
    this.currentUser = await fetchCurrentUser();
  }

  renderUser() {
    if (!this.currentUser) return;

    const avatarEl = this.rootElem.querySelector("#user-avatar-content");
    if (avatarEl) avatarEl.textContent = this.getUserAvatar(this.currentUser);

    const nameEl = this.rootElem.querySelector("#userName");
    if (nameEl)
      nameEl.textContent = this.formatUsername(this.currentUser.username);

    const emailEl = this.rootElem.querySelector("#userEmail");
    if (emailEl) emailEl.textContent = this.currentUser.email;

    const roleEl = this.rootElem.querySelector("#userRole");
    if (roleEl)
      roleEl.textContent = this.formatRole(ROLES[this.currentUser.role_id]);
  }

  destroy() {
    this.adminPageBtn?.removeEventListener("click", this.onAdminPageBtnClick);
    this.logoutBtn?.removeEventListener("click", this.onLogoutClick);

    this.adminPageBtn = null;
    this.logoutBtn = null;
    this.rootElem = null;
    this.currentUser = null;

    this.isInitialized = false;
  }

  // Generates avatar (user initials)
  getUserAvatar(user) {
    if (!user?.username) return "";

    return user.username
      .split(" ")
      .map((w) => w[0].toUpperCase())
      .join("");
  }

  // Formats username (Capitalized Words)
  formatUsername(username) {
    return username
      .split(" ")
      .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  // Formats role (Capitalized)
  formatRole(role = "") {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }
}

export default DashboardController;
