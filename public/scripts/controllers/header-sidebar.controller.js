import { formatText } from "../../utils/general.js";
import {
  getUserAvatar,
  beautifyUsername,
  beautifyRole,
} from "../../utils/user.js";
import { fetchCurrentUser, changePassword, logout } from "../auth/user.js";
import { API_BASE_URL } from "../config.js";
import {
  getController,
  registerController,
} from "../core/controller-registry.js";
import { logger } from "../core/logger.js";
import { goTo } from "../core/router.js";

class HeaderSidebarController {
  static instance = null;

  static getInstance() {
    if (!HeaderSidebarController.instance) {
      HeaderSidebarController.instance = new HeaderSidebarController();
    }
    return HeaderSidebarController.instance;
  }

  constructor() {
    this.rootElem = null;
    this.isInitialized = false;
    this.dashboardControllerInstance = null;
    this.currentUser = null;

    this.elements = {};
    this.handlers = {};

    this.myTickets = [];
    this.assignedTickets = [];
    this.ticketsToShow = [];
  }

  async init(rootElem) {
    if (!this.isInitialized) this.destroy();

    this.rootElem = rootElem;

    this.gatherElements();
    await this.loadUser();
    this.bindEvents();

    this.renderElements();

    setTimeout(() => {
      this.setActiveList("owned-tickets");
    }, 100);

    this.isInitialized = true;
  }

  gatherElements() {
    if (!this.rootElem) return;

    this.elements = {
      listButtons: this.rootElem.querySelectorAll("[data-list]"),
      optionsPanelToggleBtn: this.rootElem.querySelector(
        '[data-js="header-sidebar-options-btn"]',
      ),
      optionsPanel: this.rootElem.querySelector(
        '[data-js="header-sidebar-options"]',
      ),
      passwordBtn: this.rootElem.querySelector(
        '[data-js="header-sidebar-options-panel-btn-password"]',
      ),
      adminBtn: this.rootElem.querySelector(
        '[data-js="header-sidebar-options-panel-btn-admin"]',
      ),
      logoutBtn: this.rootElem.querySelector(
        '[data-js="header-sidebar-options-panel-btn-logout"]',
      ),
      userAvatar: this.rootElem.querySelector(
        '[data-js="header-sidebar-user-avatar-content"]',
      ),
      userAvatarIconAdmin: this.rootElem.querySelector(
        '[data-js="header-sidebar-user-avatar-icon-admin"]',
      ),
      userAvatarIconTech: this.rootElem.querySelector(
        '[data-js="header-sidebar-user-avatar-icon-tech"]',
      ),
      userAvatarIconUser: this.rootElem.querySelector(
        '[data-js="header-sidebar-user-avatar-icon-user"]',
      ),
      userUsername: this.rootElem.querySelector(
        '[data-js="header-sidebar-user-username"]',
      ),
      userEmail: this.rootElem.querySelector('[data-js="header-user-email"]'),
      userRole: this.rootElem.querySelector('[data-js="header-user-role"]'),
    };
  }

  async loadUser() {
    this.currentUser = await fetchCurrentUser();
    if (!this.currentUser) return;
  }

  bindEvents() {
    this.handlers.list = (event) => {
      const btn = event.target.closest("[data-list]");
      if (!btn) return;

      const list = btn.dataset.list;
      if (list === "all-tickets" && this.currentUser.role === "user") return;
      if (list === "assigned-tickets" && this.currentUser.role === "user")
        return;

      this.setActiveList(list);
    };

    this.elements.listButtons?.forEach((btn) => {
      btn.addEventListener("click", this.handlers.list);
    });

    this.elements.optionsPanelToggleBtn?.addEventListener("click", () =>
      this.toggleOptionsPanel(),
    );

    this.elements.passwordBtn?.addEventListener("click", () =>
      this.changePassword(),
    );
    this.elements.adminBtn?.addEventListener("click", () =>
      goTo("admin-panel"),
    );
    this.elements.logoutBtn?.addEventListener("click", logout);
  }

  renderElements() {
    if (this.elements.userAvatar) {
      this.elements.userAvatar.title = `${beautifyUsername(
        this.currentUser.username,
      )} - ${beautifyRole(this.currentUser.role)}`;
    }

    if (this.elements.userUsername) {
      this.elements.userUsername.textContent = beautifyUsername(
        this.currentUser.username,
      );
      this.elements.userUsername.title = this.currentUser.email;
    }

    // if (this.elements.userEmail) {
    //   this.elements.userEmail.textContent = this.currentUser.email;
    //   this.elements.userEmail.title = this.currentUser.email;
    // }

    // if (this.elements.userRole) {
    //   this.elements.userRole.textContent = `${formatText(this.currentUser.role)}`;
    // }

    if (this.elements.userAvatar) {
      this.elements.userAvatar.textContent = getUserAvatar(
        this.currentUser.username,
      );
    }
    if (this.elements.userAvatarIconAdmin) {
      this.elements.userAvatarIconAdmin.hidden =
        this.currentUser.role !== "admin";
    }
    if (this.elements.userAvatarIconTech) {
      this.elements.userAvatarIconTech.hidden =
        this.currentUser.role !== "technician";
    }
    if (this.elements.userAvatarIconUser) {
      this.elements.userAvatarIconUser.hidden =
        this.currentUser.role !== "user";
    }

    // Filter buttons state
    const allTicketsBtn = Array.from(this.elements.listButtons)?.find(
      (b) => b.dataset.list === "all-tickets",
    );
    const assignedTicketsBtn = Array.from(this.elements.listButtons)?.find(
      (b) => b.dataset.list === "assigned-tickets",
    );
    const myTicketsBtn = Array.from(this.elements.listButtons)?.find(
      (b) => b.dataset.list === "owned-tickets",
    );

    const isAdmin = this.currentUser.role === "admin";
    const isUser = this.currentUser.role === "user";

    // Reset all list buttons
    allTicketsBtn.classList.remove("active", "inactive");
    assignedTicketsBtn.classList.remove("active", "inactive");
    myTicketsBtn.classList.remove("active", "inactive");

    if (isUser) {
      allTicketsBtn.classList.add("inactive");
      assignedTicketsBtn.classList.add("inactive");
    }

    myTicketsBtn.classList.add("active");

    this.elements.adminBtn.style.display = isAdmin ? "block" : "none";
  }

  destroy() {
    this.elements.listButtons?.forEach((btn) => {
      btn.removeEventListener("click", this.handlers.list);
    });

    this.elements.logoutBtn?.removeEventListener("click", this.handlers.logout);

    this.rootElem = null;
    this.elements = {};
    this.handlers = {};
    this.isInitialized = false;
  }

  setActiveList(list) {
    this.dashboardControllerInstance =
      getController("dashboard")?.getInstance();
    this.elements.listButtons?.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.list === list);
    });

    this.dashboardControllerInstance.setActiveList(list);
  }

  toggleOptionsPanel() {
    this.elements.optionsPanel.classList.toggle("opened");
  }

  async changePassword() {
    const modal = getController("modal").getInstance();

    const content = await (
      await fetch("../components/forms/user-change-password.form.html")
    ).text();

    modal.open({
      title: "Change password",
      content,
      footer: `
      <button class="btn btn-primary btn-wider-lg" data-action="save">Save</button>
      <button class="btn btn-primary btn-wider-lg" data-action="cancel">Cancel</button>
    `,
      actions: {
        save: async () => {
          const data = modal.getFormData();

          const currentPassword = data?.["modal-user-password-current"];
          const newPassword = data?.["modal-user-password-new"];
          const confirmPassword = data?.["modal-user-password-confirm"];

          // Validation
          if (!currentPassword || !newPassword || !confirmPassword) {
            logger.warn("changePassword: missing fields", {
              currentPassword,
              newPassword,
              confirmPassword,
            });
            return;
          }

          if (newPassword !== confirmPassword) {
            logger.warn("changePassword: passwords do not match");
            return;
          }

          const token = localStorage.getItem("auth_token");

          const res = await fetch(`${API_BASE_URL}/users/change-password`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              currentPassword,
              newPassword,
            }),
          });

          modal.close();

          if (!res.ok) {
            const error = await res.json();
            logger.error("changePassword: server error", {
              status: res.status,
              message: error,
            });
            return;
          }
        },

        cancel: () => modal.close(),
      },
    });
  }
}

registerController("header-sidebar", HeaderSidebarController);

export default HeaderSidebarController;
