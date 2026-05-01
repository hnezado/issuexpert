import { API_BASE_URL, ROLES } from "../config.js";
import { goTo } from "../core/router.js";
import { fetchCurrentUser } from "../auth/user.js";
import { logger } from "../core/logger.js";
import { registerController } from "../core/controller-registry.js";
import { formatDate } from "../../utils/date.js";

/**
 * AdminPanelController (singleton)
 * Manages admin panel UI: user loading, rendering and events.
 */
class AdminPanelController {
  static instance = null;

  // Singleton getter
  static getInstance() {
    if (!AdminPanelController.instance) {
      AdminPanelController.instance = new AdminPanelController();
    }
    return AdminPanelController.instance;
  }

  constructor() {
    if (AdminPanelController.instance) return AdminPanelController.instance;

    this.currentUser = null;
    this.users = [];

    this.elements = {};

    this.isInitialized = false;

    AdminPanelController.instance = this;
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

    if (ROLES?.[this.currentUser.role_id] !== "admin") {
      goTo("dashboard");
      return;
    }

    await this.loadUsers();

    this.renderElements();
    this.bindEvents();

    this.isInitialized = true;
  }

  gatherElements() {
    if (!this.rootElem) {
      logger.error("AdminPanelController: rootElem is missing");
      return;
    }

    // Users
    this.elements.usersTbody = {
      elem: this.rootElem.querySelector('[data-js="admin-panel-users-tbody"]'),
    };
    this.elements.createUserBtn = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-btn-create-user"]',
      ),
      eventType: "click",
      handler: () => this.createUser(),
    };
    this.elements.updateUserBtn = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-btn-update-user"]',
      ),
      eventType: "click",
      handler: () => this.updateUser(),
    };
    this.elements.deleteUserBtn = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-btn-delete-user"]',
      ),
      eventType: "click",
      handler: () => this.deleteUser(),
    };

    // Tickets
    this.elements.ticketsTbody = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-tickets-tbody"]',
      ),
    };

    // Ticket categories
    this.elements.categoriesTbody = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-categories-tbody"]',
      ),
    };

    const missingElements = Object.entries(this.elements)
      .filter(([k, v]) => !v.elem)
      .map(([k]) => k);
    if (missingElements.length) {
      logger.warn("AdminPanelController: some DOM elements are missing", {
        missing: missingElements,
      });
    }
  }

  async loadUser() {
    this.currentUser = await fetchCurrentUser();

    if (!this.currentUser) {
      logger.warn("AdminPanelController: user not loaded");
      return;
    }
  }

  async loadUsers() {
    const token = localStorage.getItem("auth_token");
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      this.users = await res.json();
    } catch (err) {
      logger.error("AdminPanelController: failed loading users", err);
    }
  }

  renderElements() {
    if (!this.currentUser) {
      logger.warn("AdminPanelController: render skipped, no user");
      return;
    }

    // Users table injection
    if (!this.elements.usersTbody?.elem) return;

    this.elements.usersTbody.elem.innerHTML = "";

    this.users.forEach((user) => {
      const row = document.createElement("tr");
      const role = ROLES?.[user.role_id];

      // Style for inactive user
      if (!user.active) {
        row.classList.add("row-inactive");
      }

      row.innerHTML = `
          <td>${user.id}</td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${this.getRoleName(role)}</td>
          <td>${formatDate(user.created_at)}</td>
        `;

      this.elements.usersTbody.elem.appendChild(row);
    });
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
    this.users = [];
    this.elements = {};
    this.rootElem = null;
    this.isInitialized = false;
  }

  createUser() {
    logger.info("Create user clicked");
  }

  editUser(id) {
    logger.info("Edit user", { id });
  }

  deleteUser(id) {
    logger.warn("Delete user", { id });
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

registerController("admin-panel", AdminPanelController);

export default AdminPanelController;
