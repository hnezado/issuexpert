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
    this.dashboardControllerInstance =
      getController("dashboard")?.getInstance();

    this.gatherElements();
    await this.loadUser();
    this.renderElements();
    this.bindEvents();

    // Gives enough time to dashboard to initialize
    setTimeout(() => {
      this.setActiveFilter("owned-tickets");
    }, 1000);

    this.isInitialized = true;
  }

  gatherElements() {
    if (!this.rootElem) return;

    this.elements = {
      filterButtons: this.rootElem.querySelectorAll("[data-filter]"),
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
    const allTicketsBtn = Array.from(this.elements.filterButtons)?.find(
      (b) => b.dataset.filter === "all-tickets",
    );
    const assignedTicketsBtn = Array.from(this.elements.filterButtons)?.find(
      (b) => b.dataset.filter === "assigned-tickets",
    );
    const myTicketsBtn = Array.from(this.elements.filterButtons)?.find(
      (b) => b.dataset.filter === "owned-tickets",
    );
    const isAdmin = this.currentUser.role === "admin";
    const isTech = this.currentUser.role === "technician";
    const isUser = this.currentUser.role === "user";

    // Reset all filter buttons
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
    this.handlers.filter = (event) => {
      const btn = event.target.closest("[data-filter]");
      if (!btn) return;

      const filter = btn.dataset.filter;
      if (filter === "all-tickets" && this.currentUser.role !== "admin") return;
      if (filter === "assigned-tickets" && this.currentUser.role === "user")
        return;

      this.setActiveFilter(filter);
    };

    this.elements.filterButtons?.forEach((btn) => {
      btn.addEventListener("click", this.handlers.filter);
    });

    this.elements.adminBtn?.addEventListener("click", () =>
      goTo("admin-panel"),
    );
    this.elements.logoutBtn?.addEventListener("click", logout);
  }

  destroy() {
    this.elements.filterButtons?.forEach((btn) => {
      btn.removeEventListener("click", this.handlers.filter);
    });

    this.elements.logoutBtn?.removeEventListener("click", this.handlers.logout);

    this.rootElem = null;
    this.elements = {};
    this.handlers = {};
    this.isInitialized = false;
  }

  setActiveFilter(filter) {
    const dashboardController = getController("dashboard")?.getInstance();
    this.elements.filterButtons?.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter);
    });

    this.dashboardControllerInstance.setActiveFilter(filter);
  }
}

registerController("header-sidebar", HeaderSidebarController);

export default HeaderSidebarController;
