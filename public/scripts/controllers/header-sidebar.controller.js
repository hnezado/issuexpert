import { formatText } from "../../utils/general.js";
import { getUserAvatar, beautifyUsername } from "../../utils/user.js";
import { fetchCurrentUser, logout } from "../auth/user.js";
import {
  getController,
  registerController,
} from "../core/controller-registry.js";
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
      userUsername: this.rootElem.querySelector(
        '[data-js="header-user-username"]',
      ),
      userEmail: this.rootElem.querySelector('[data-js="header-user-email"]'),
      userRole: this.rootElem.querySelector('[data-js="header-user-role"]'),
      userAvatar: this.rootElem.querySelector('[data-js="header-user-avatar"]'),
      adminBtn: this.rootElem.querySelector('[data-js="header-btn-admin"]'),
      logoutBtn: this.rootElem.querySelector('[data-js="header-btn-logout"]'),
    };
  }

  async loadUser() {
    this.currentUser = await fetchCurrentUser();
    if (!this.currentUser) return;
  }

  renderElements() {
    if (this.elements.userUsername) {
      this.elements.userUsername.textContent = beautifyUsername(
        this.currentUser.username,
      );
      this.elements.userUsername.title = this.currentUser.email;
    }

    if (this.elements.userRole) {
      this.elements.userRole.textContent = `Role: ${formatText(this.currentUser.role)}`;
    }

    if (this.elements.userAvatar) {
      this.elements.userAvatar.textContent = getUserAvatar(
        this.currentUser.username,
      );
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
    const isTech = this.currentUser.role === "technician";
    const isUser = this.currentUser.role === "user";

    // Reset all list buttons
    allTicketsBtn.classList.remove("active", "inactive");
    assignedTicketsBtn.classList.remove("active", "inactive");
    myTicketsBtn.classList.remove("active", "inactive");

    if (isTech) {
      allTicketsBtn.classList.add("inactive");
    } else if (isUser) {
      allTicketsBtn.classList.add("inactive");
      assignedTicketsBtn.classList.add("inactive");
    }

    myTicketsBtn.classList.add("active");

    this.elements.adminBtn.style.display = isAdmin ? "block" : "none";
  }

  bindEvents() {
    this.handlers.list = (event) => {
      const btn = event.target.closest("[data-list]");
      if (!btn) return;

      const list = btn.dataset.list;
      if (list === "all-tickets" && this.currentUser.role !== "admin") return;
      if (list === "assigned-tickets" && this.currentUser.role === "user")
        return;

      this.setActiveList(list);
    };

    this.elements.listButtons?.forEach((btn) => {
      btn.addEventListener("click", this.handlers.list);
    });

    this.elements.adminBtn?.addEventListener("click", () =>
      goTo("admin-panel"),
    );
    this.elements.logoutBtn?.addEventListener("click", logout);
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
}

registerController("header-sidebar", HeaderSidebarController);

export default HeaderSidebarController;
