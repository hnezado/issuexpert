import { goTo } from "../core/router.js";
import { fetchCurrentUser, logout } from "../auth/user.js";
import { logger } from "../core/logger.js";
import { registerController } from "../core/controller-registry.js";
import { formatText } from "../../utils/general.js";
import { beautifyUsername, getUserAvatar } from "../../utils/user.js";

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
    this.currentUser = null;
    this.elements = {};
    this.isInitialized = false;
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
      logger.error("HeaderController.gatherElements: no rootElem");
      return;
    }

    this.elements.logo = {
      elem: this.rootElem.querySelector('[data-js="header-topbar-logo"]'),
      eventType: "click",
      handler: () => goTo("dashboard"),
    };
    this.elements.adminBtn = {
      elem: this.rootElem.querySelector('[data-js="header-topbar-btn-admin"]'),
      eventType: "click",
      handler: () => goTo("admin-panel"),
    };
    this.elements.logoutBtn = {
      elem: this.rootElem.querySelector('[data-js="header-topbar-btn-logout"]'),
      eventType: "click",
      handler: () => logout(),
    };
    this.elements.avatar = {
      elem: this.rootElem.querySelector(
        '[data-js="header-topbar-user-avatar"]',
      ),
    };
    this.elements.name = {
      elem: this.rootElem.querySelector('[data-js="header-topbar-user-name"]'),
    };
    this.elements.email = {
      elem: this.rootElem.querySelector('[data-js="header-topbar-user-email"]'),
    };
    this.elements.role = {
      elem: this.rootElem.querySelector('[data-js="header-topbar-user-role"]'),
    };

    const missingElements = Object.entries(this.elements)
      .filter(([k, v]) => !v.elem)
      .map(([k]) => k);
    if (missingElements.length) {
      logger.warn(
        "HeaderController.gatherElements: some DOM elements are missing",
        {
          missingElements,
        },
      );
    }
  }

  async loadUser() {
    this.currentUser = await fetchCurrentUser();
    if (!this.currentUser) {
      logger.warn("HeaderController.loadUser: no current user");
      return;
    }
  }

  renderElements() {
    if (!this.currentUser) {
      logger.warn("HeaderController.renderElements: no current user");
      return;
    }

    // Admin button injection
    if (this.elements.adminBtn?.elem && this.currentUser.role !== "admin") {
      this.elements.adminBtn.elem.style.display = "none";
    }

    // Avatar injection
    if (this.elements.avatar?.elem)
      this.elements.avatar.elem.textContent = getUserAvatar(
        this.currentUser?.username,
      );

    // Username injection
    if (this.elements.name?.elem)
      this.elements.name.elem.textContent = beautifyUsername(
        this.currentUser.username,
      );

    // Email injection
    if (this.elements.email?.elem)
      this.elements.email.elem.textContent = this.currentUser.email;

    // Role injection
    const role = this.currentUser.role;
    if (!role) {
      logger.warn("HeaderController.renderElements: no role");
    } else {
      if (this.elements.role?.elem) {
        this.elements.role.elem.textContent = formatText(role);
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
}

registerController("header", HeaderController);

export default HeaderController;
