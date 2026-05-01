import { goTo } from "../core/router.js";
import { fetchCurrentUser } from "../auth/user.js";
import { logout } from "../auth/logout.js";
import { ROLES } from "../config.js";
import { logger } from "../core/logger.js";

/**
 * HeaderController (singleton)
 * Manages header UI: user loading, rendering and events.
 */
class HeaderController {
  static instance = null;

  // Singleton getter
  static getInstance() {
    if (!HeaderController.instance) {
      HeaderController.instance = new HeaderController();
    }
    return HeaderController.instance;
  }

  constructor() {
    if (HeaderController.instance) return HeaderController.instance;

    this.currentUser = null;
    this.elements = {};

    this.isInitialized = false;

    HeaderController.instance = this;
  }

  async init(rootElem) {
    if (this.isInitialized) this.destroy();

    this.rootElem = rootElem;

    this.gatherElements();

    await this.loadUser();
    // If user fails to load, abort initialization
    if (!this.currentUser) {
      this.destroy();
      return;
    }

    this.renderElements();
    this.bindEvents();

    this.isInitialized = true;
  }

  gatherElements() {
    if (!this.rootElem) {
      logger.error("HeaderController: rootElem is missing");
      return;
    }

    this.elements.logo = {
      elem: this.rootElem.querySelector('[data-js="header-logo"]'),
      eventType: "click",
      handler: () => goTo("dashboard"),
    };
    this.elements.adminBtn = {
      elem: this.rootElem.querySelector('[data-js="header-btn-admin"]'),
      eventType: "click",
      handler: () => goTo("adminPanel"),
    };
    this.elements.logoutBtn = {
      elem: this.rootElem.querySelector('[data-js="header-btn-logout"]'),
      eventType: "click",
      handler: () => logout(),
    };
    this.elements.avatar = {
      elem: this.rootElem.querySelector('[data-js="header-user-avatar"]'),
    };
    this.elements.name = {
      elem: this.rootElem.querySelector('[data-js="header-user-name"]'),
    };
    this.elements.email = {
      elem: this.rootElem.querySelector('[data-js="header-user-email"]'),
    };
    this.elements.role = {
      elem: this.rootElem.querySelector('[data-js="header-user-role"]'),
    };

    const missingElements = Object.entries(this.elements)
      .filter(([k, v]) => !v.elem)
      .map(([k]) => k);
    if (missingElements.length) {
      logger.warn("HeaderController: some DOM elements are missing", {
        missing: missingElements,
      });
    }
  }

  async loadUser() {
    this.currentUser = await fetchCurrentUser();

    if (!this.currentUser) {
      logger.warn("HeaderController: user not loaded");
      return;
    }
  }

  renderElements() {
    if (!this.currentUser) {
      logger.warn("HeaderController: render skipped, no user");
      return;
    }

    // Admin button injection
    if (
      this.elements.adminBtn?.elem &&
      ROLES?.[this.currentUser.role_id] !== "admin"
    ) {
      this.elements.adminBtn.elem.style.display = "none";
    }

    // Avatar injection
    if (this.elements.avatar?.elem)
      this.elements.avatar.elem.textContent = this.getUserAvatar(
        this.currentUser,
      );

    // Username injection
    if (this.elements.name?.elem)
      this.elements.name.elem.textContent = this.formatUsername(
        this.currentUser.username,
      );

    // Email injection
    if (this.elements.email?.elem)
      this.elements.email.elem.textContent = this.currentUser.email;

    // Role injection
    const role = ROLES?.[this.currentUser.role_id];
    if (!role) {
      logger.warn("HeaderController: role not found", {
        role_id: this.currentUser.role_id,
      });
    } else {
      if (this.elements.role?.elem) {
        this.elements.role.elem.textContent = this.getRoleName(role);
      }
    }
  }

  bindEvents() {
    Object.values(this.elements)
      .filter((e) => e.elem && e.eventType && e.handler)
      .forEach((e) => {
        e.elem.addEventListener(e.eventType, e.handler);
      });
  }

  destroy() {
    Object.values(this.elements)
      .filter((e) => e.elem && e.eventType && e.handler)
      .forEach((e) => {
        e.elem.removeEventListener(e.eventType, e.handler);
      });

    this.currentUser = null;

    this.elements = {};
    this.rootElem = null;

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

  // Formats username (each word Capitalized)
  formatUsername(username) {
    return username
      .split(" ")
      .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  // Returns the formated role (Capitalized)
  getRoleName(role = "") {
    if (!role) return "";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }
}

export default HeaderController;
