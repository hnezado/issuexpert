import ENV from "../core/env.js";
import { API_BASE_URL } from "../config.js";
import { goTo } from "../core/router.js";
import { fetchCurrentUser } from "../auth/user.js";
import { logger } from "../core/logger.js";
import {
  getController,
  registerController,
} from "../core/controller-registry.js";
import { formatText } from "../../utils/general.js";
import { formatDate } from "../../utils/date.js";
import {
  getPriorityStr,
  formatPriority,
  formatStatus,
} from "../../utils/tickets.js";
import {
  cleanUsername,
  isValidUsername,
  isValidEmail,
  isValidPassword,
} from "../../utils/user.js";

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
    this.currentUser = null;
    this.users = [];
    this.elements = {};
    this.activeTab = null;
    this.selectedUser = null;
    this.selectedTicket = null;
    this.selectedCategory = null;
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

    if (this.currentUser.role !== "admin") {
      goTo("dashboard");
      return;
    }

    await this.loadUsers();
    await this.loadTickets();
    await this.loadCategories();

    this.renderUsers();
    this.renderTickets();
    this.renderCategories();
    this.showTab("categories");
    this.updateActionButtons();
    this.bindEvents();

    this.isInitialized = true;
  }

  gatherElements() {
    if (!this.rootElem) {
      logger.error("AdminPanelController.gatherElements: no rootElem");
      return;
    }

    // Users
    this.elements.usersTabBtn = {
      elem: this.rootElem.querySelector('[data-js="admin-panel-tab-users"]'),
      eventType: "click",
      handler: (e) => this.showTab("users"),
    };
    this.elements.usersTab = {
      elem: this.rootElem.querySelector('[data-js="admin-panel-users-tab"]'),
    };
    this.elements.usersTableBody = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-users-table-body"]',
      ),
      eventType: "click",
      handler: (e) => this.handleTableClick(e),
    };
    this.elements.createUserBtn = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-user-create-btn"]',
      ),
      eventType: "click",
      handler: (e) => this.createUser(),
    };
    this.elements.updateUserBtn = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-user-update-btn"]',
      ),
      eventType: "click",
      handler: (e) => this.updateUser(),
    };
    this.elements.deleteUserBtn = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-user-delete-btn"]',
      ),
      eventType: "click",
      handler: (e) => this.deleteUser(),
    };

    // Tickets
    this.elements.ticketsTabBtn = {
      elem: this.rootElem.querySelector('[data-js="admin-panel-tab-tickets"]'),
      eventType: "click",
      handler: (e) => this.showTab("tickets"),
    };
    this.elements.ticketsTab = {
      elem: this.rootElem.querySelector('[data-js="admin-panel-tickets-tab"]'),
    };
    this.elements.ticketsTableBody = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-tickets-table-body"]',
      ),
      eventType: "click",
      handler: (e) => this.handleTableClick(e),
    };
    this.elements.createTicketBtn = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-ticket-create-btn"]',
      ),
      eventType: "click",
      handler: () => this.createTicket(),
    };
    this.elements.updateTicketBtn = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-ticket-update-btn"]',
      ),
      eventType: "click",
      handler: () => this.updateTicket(),
    };
    this.elements.deleteTicketBtn = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-ticket-delete-btn"]',
      ),
      eventType: "click",
      handler: () => this.deleteTicket(),
    };

    // Categories
    this.elements.categoriesTabBtn = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-tab-categories"]',
      ),
      eventType: "click",
      handler: (e) => this.showTab("categories"),
    };
    this.elements.categoriesTab = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-categories-tab"]',
      ),
    };
    this.elements.categoriesTableBody = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-categories-table-body"]',
      ),
      eventType: "click",
      handler: (e) => this.handleTableClick(e),
    };
    this.elements.createCategoryBtn = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-category-create-btn"]',
      ),
      eventType: "click",
      handler: () => this.createCategory(),
    };
    this.elements.updateCategoryBtn = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-category-update-btn"]',
      ),
      eventType: "click",
      handler: () => this.updateCategory(),
    };
    this.elements.deleteCategoryBtn = {
      elem: this.rootElem.querySelector(
        '[data-js="admin-panel-category-delete-btn"]',
      ),
      eventType: "click",
      handler: () => this.deleteCategory(),
    };

    const missingElements = Object.entries(this.elements)
      .filter(([k, v]) => !v.elem)
      .map(([k]) => k);
    if (missingElements.length) {
      logger.warn(
        "AdminPanelController.gatherElements: some DOM elements are missing",
        {
          missingElements,
        },
      );
    }
  }

  async loadUser() {
    this.currentUser = await fetchCurrentUser();

    if (!this.currentUser) {
      logger.warn("AdminPanelController.loadUser: no current user");
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
    } catch (error) {
      logger.error("AdminPanelController.loadUsers: error loading users", {
        error,
      });
    }
  }

  async loadTickets() {
    const token = localStorage.getItem("auth_token");
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/tickets`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      this.tickets = await res.json();
    } catch (error) {
      logger.error("AdminPanelController.loadTickets: error loading tickets", {
        error,
      });
    }
  }

  async loadCategories() {
    const token = localStorage.getItem("auth_token");
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      this.categories = await res.json();
    } catch (error) {
      logger.error(
        "AdminPanelController.loadCategories: error loading categories",
        {
          error,
        },
      );
    }
  }

  renderUsers() {
    if (!this.currentUser) {
      logger.warn("AdminPanelController.renderUsers: no current user");
      return;
    }

    // Table injection
    if (!this.elements.usersTableBody?.elem) return;

    this.elements.usersTableBody.elem.innerHTML = `
      <div data-js="admin-panel-users-table-thead-tr" class="row header">
        <div data-js="admin-panel-users-table-th-id" class="cell">ID</div>
        <div data-js="admin-panel-users-table-th-username" class="cell">Username</div>
        <div data-js="admin-panel-users-table-th-email" class="cell">Email</div>
        <div data-js="admin-panel-users-table-th-role" class="cell hide-750">Role</div>
        <div data-js="admin-panel-users-table-th-user-since" class="cell hide-900">User since</div>
      </div>
    `;

    this.users?.forEach((user) => {
      const row = document.createElement("div");
      row.classList.add("row");
      row.dataset.js = "admin-panel-users-table-row";
      row.dataset.id = user.id;

      row.innerHTML = `
        <div class="cell" data-label="ID">#${user.id}</div>
        <div class="cell" data-label="Username">${user.username}</div>
        <div class="cell" data-label="Email">${user.email}</div>
        <div class="cell hide-750" data-label="Role">${formatText(user.role)}</div>
        <div class="cell hide-900" data-label="User since">${formatDate(user.created_at)}</div>
      `;

      this.elements.usersTableBody.elem.appendChild(row);
    });
  }

  renderTickets() {
    if (!this.currentUser) {
      logger.warn("AdminPanelController.renderTickets: no current user");
      return;
    }

    // Table injection
    if (!this.elements.ticketsTableBody?.elem) return;

    this.elements.ticketsTableBody.elem.innerHTML = `
      <div data-js="admin-panel-tickets-table-thead-tr" class="row header">
        <div data-js="admin-panel-tickets-table-th-id" class="cell">ID</div>
        <div data-js="admin-panel-tickets-table-th-title" class="cell">Title</div>
        <div data-js="admin-panel-tickets-table-th-description" class="cell hide-750">Description</div>
        <div data-js="admin-panel-tickets-table-th-priority" class="cell hide-500">Priority</div>
        <div data-js="admin-panel-tickets-table-th-status" class="cell hide-600">Status</div>
        <div data-js="admin-panel-tickets-table-th-created-by" class="cell">Created by userID</div>
        <div data-js="admin-panel-tickets-table-th-updated-at" class="cell hide-900">Last modified</div>
      </div>
    `;

    this.tickets?.forEach((ticket) => {
      const row = document.createElement("div");
      row.classList.add("row");
      row.dataset.js = "admin-panel-tickets-table-row";
      row.dataset.id = ticket.id;

      row.innerHTML = `
        <div class="cell" data-label="ID">#${ticket.id}</div>
        <div class="cell" data-label="Title">${ticket.title}</div>
        <div class="cell hide-750" data-label="Description">${ticket.description}</div>
        <div class="cell priority-${getPriorityStr(ticket.priority)}">
          ${formatPriority(ticket.priority, true)}
        </div>
        <div class="cell hide-600 status-${ticket.status.replace("_", "-")} no-wrap" data-label="Status">${formatStatus(ticket.status)}</div>
        <div class="cell" data-label="Created by">#${ticket.created_by}</div>
        <div class="cell hide-900" data-label="Last modified">${formatDate(ticket.updated_at, true)}</div>
      `;

      this.elements.ticketsTableBody?.elem.appendChild(row);
    });
  }

  renderCategories() {
    if (!this.currentUser) {
      logger.warn("AdminPanelController.renderCategories: no current user");
      return;
    }

    // Table injection
    if (!this.elements.categoriesTableBody?.elem) return;

    this.elements.categoriesTableBody.elem.innerHTML = `
      <div data-js="admin-panel-categories-table-thead-tr" class="row header">
        <div data-js="admin-panel-categories-table-th-id" class="cell">ID</div>
        <div data-js="admin-panel-categories-table-th-name" class="cell">Name</div>
      </div>
    `;

    this.categories?.forEach((category) => {
      const row = document.createElement("div");
      row.classList.add("row");
      row.dataset.js = "admin-panel-categories-table-row";
      row.dataset.id = category.id;

      row.innerHTML = `
        <div class="cell" data-label="ID">#${category.id}</div>
        <div class="cell" data-label="Name">${category.name}</div>
      `;

      this.elements.categoriesTableBody?.elem.appendChild(row);
    });
  }

  bindEvents() {
    Object.values(this.elements)
      .filter((e) => e.elem && e.eventType && e.handler)
      .forEach((e) => {
        e.elem.addEventListener(e.eventType, e.handler);
      });

    // Lock right menu on tables
    this.elements?.usersTableBody?.elem?.addEventListener(
      "contextmenu",
      (event) => {
        event.preventDefault();
      },
    );
    this.elements?.ticketsTableBody?.elem?.addEventListener(
      "contextmenu",
      (event) => {
        event.preventDefault();
      },
    );
    this.elements?.categoriesTableBody?.elem?.addEventListener(
      "contextmenu",
      (event) => {
        event.preventDefault();
      },
    );
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

  showTab(tabName) {
    this.activeTab = tabName;

    this.elements.usersTabBtn.elem.classList.remove("active");
    this.elements.ticketsTabBtn.elem.classList.remove("active");
    this.elements.categoriesTabBtn.elem.classList.remove("active");

    this.elements.usersTab.elem.classList.add("hidden");
    this.elements.ticketsTab.elem.classList.add("hidden");
    this.elements.categoriesTab.elem.classList.add("hidden");

    this.elements.usersTab.elem.classList.remove("active");
    this.elements.ticketsTab.elem.classList.remove("active");
    this.elements.categoriesTab.elem.classList.remove("active");

    if (tabName === "users") {
      this.elements.usersTabBtn.elem.classList.add("active");
      this.elements.usersTab.elem.classList.remove("hidden");
      this.elements.usersTab.elem.classList.add("active");
    }

    if (tabName === "tickets") {
      this.elements.ticketsTabBtn.elem.classList.add("active");
      this.elements.ticketsTab.elem.classList.remove("hidden");
      this.elements.ticketsTab.elem.classList.add("active");
    }

    if (tabName === "categories") {
      this.elements.categoriesTabBtn.elem.classList.add("active");
      this.elements.categoriesTab.elem.classList.remove("hidden");
      this.elements.categoriesTab.elem.classList.add("active");
    }
  }

  handleTableClick(e) {
    const table = e.target.closest(".table-body[data-name]");
    if (!table) return;
    const tableName = table.dataset.name;

    const row = e.target.closest(".row[data-id]");
    if (!row) return;

    const alreadySelected = row.classList.contains("selected");

    table
      .querySelectorAll(".row.selected")
      .forEach((r) => r.classList.remove("selected"));

    if (!alreadySelected) row.classList.add("selected");

    const rowId = Number(row.dataset.id);

    if (tableName === "users") {
      if (alreadySelected) {
        this.selectedUser = null;
      } else {
        this.selectedUser = this.users.find((u) => u.id === rowId);
      }
    } else if (tableName === "tickets") {
      if (alreadySelected) {
        this.selectedTicket = null;
      } else {
        this.selectedTicket = this.tickets.find((t) => t.id === rowId);
      }
    } else if (tableName === "categories") {
      if (alreadySelected) {
        this.selectedCategory = null;
      } else {
        this.selectedCategory = this.categories.find((c) => c.id === rowId);
      }
    }

    this.updateActionButtons(tableName);
  }

  updateActionButtons() {
    if (this.elements.updateUserBtn?.elem) {
      this.elements.updateUserBtn.elem.disabled = !this.selectedUser;
    }

    if (this.elements.deleteUserBtn?.elem) {
      this.elements.deleteUserBtn.elem.disabled = !this.selectedUser;
    }

    if (this.elements.updateTicketBtn?.elem) {
      this.elements.updateTicketBtn.elem.disabled = !this.selectedTicket;
    }

    if (this.elements.deleteTicketBtn?.elem) {
      this.elements.deleteTicketBtn.elem.disabled = !this.selectedTicket;
    }

    if (this.elements.updateCategoryBtn?.elem) {
      this.elements.updateCategoryBtn.elem.disabled = !this.selectedCategory;
    }

    if (this.elements.deleteCategoryBtn?.elem) {
      this.elements.deleteCategoryBtn.elem.disabled = !this.selectedCategory;
    }
  }

  async createUser() {
    const modal = getController("modal").getInstance();
    const content = await (
      await fetch("../components/forms/user-create.form.html")
    ).text();

    modal.open({
      title: "New user",
      content,
      footer: `
        <button class="btn btn-primary btn-wider-lg" data-action="save">Save</button>
        <button class="btn btn-primary btn-wider-lg" data-action="cancel">Cancel</button>
      `,
      actions: {
        save: async () => {
          const data = modal.getFormData();

          const username = data?.["modal-user-create-username"];
          const email = data?.["modal-user-create-email"];
          const password = data?.["modal-user-create-password"];
          const role = data?.["modal-user-create-role"];

          // Fields data validation
          if (!username || !email || !password || !role) {
            logger.warn(
              "AdminPanelController.createUser: missing required fields",
              {
                username,
                email,
                password,
                role,
              },
            );
            return;
          }
          if (!ENV.dev && !isValidUsername(cleanUsername(username))) {
            logger.warn("AdminPanelController.createUser: invalid username", {
              username,
            });
            this.selectedUser = null;
            this.updateActionButtons();
            modal.close();
            return;
          }
          if (!ENV.dev && !isValidEmail(email)) {
            logger.warn("AdminPanelController.createUser: invalid email", {
              email,
            });
            this.selectedUser = null;
            this.updateActionButtons();
            modal.close();
            return;
          }
          if (!ENV.dev && !isValidPassword(password)) {
            logger.warn("AdminPanelController.createUser: invalid password", {
              password,
            });
            this.selectedUser = null;
            this.updateActionButtons();
            modal.close();
            return;
          }

          const token = localStorage.getItem("auth_token");
          const res = await fetch(`${API_BASE_URL}/users`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              username: cleanUsername(username),
              email,
              password,
              role,
            }),
          });

          this.selectedUser = null;
          this.updateActionButtons();
          modal.close();

          if (!res.ok) {
            const error = await res.json();
            logger.error("AdminPanelController.createUser: server error", {
              status: res.status,
              message: error,
            });
            return;
          }

          await this.loadUsers();
          this.renderUsers();
        },

        cancel: () => {
          this.selectedUser = null;
          this.updateActionButtons();
          modal.close();
        },
      },
    });
  }

  async updateUser() {
    if (!this.selectedUser) {
      logger.warn("AdminPanelController.updateUser: no selected user");
      return;
    }

    const modal = getController("modal").getInstance();
    const content = await (
      await fetch("/components/forms/user-update.form.html")
    ).text();

    modal.open({
      title: "Edit user",
      content,
      footer: `
        <button class="btn btn-primary btn-wider-lg" data-action="save">Save</button>
        <button class="btn btn-primary btn-wider-lg" data-action="cancel">Cancel</button>
      `,
      actions: {
        save: async () => {
          const data = modal.getFormData();

          const username = data?.["modal-user-update-username"];
          const email = data?.["modal-user-update-email"];
          let role = data?.["modal-user-update-role"];

          // Fields data validation
          if (!username || !email || !role) {
            logger.warn(
              "AdminPanelController.updateUser: missing required fields",
              {
                username,
                email,
                role,
              },
            );
            return;
          }

          const token = localStorage.getItem("auth_token");
          const res = await fetch(
            `${API_BASE_URL}/users/${this.selectedUser?.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                username,
                email,
                role,
              }),
            },
          );

          if (!res.ok) {
            const error = await res.json();
            logger.error("AdminPanelController.updateUser: server error", {
              status: res.status,
              message: error,
            });
          }

          this.selectedUser = null;
          this.updateActionButtons();
          modal.close();
          await this.loadUsers();
          this.renderUsers();
        },
        cancel: () => {
          this.selectedUser = null;
          this.updateActionButtons();
          modal.close();
        },
      },
    });

    // User data injection
    const modalElem = document.querySelector('[data-js="modal-container"]');

    modalElem.querySelector('[data-js="modal-user-update-username"]').value =
      this.selectedUser.username;
    modalElem.querySelector('[data-js="modal-user-update-email"]').value =
      this.selectedUser.email;

    const roleInputs = modalElem.querySelectorAll(
      '[data-js="modal-user-update-role"]',
    );

    roleInputs.forEach((input) => {
      input.checked = input.value === this.selectedUser.role;
    });
  }

  async deleteUser() {
    if (!this.selectedUser) {
      logger.warn("AdminPanelController.deleteUser: no selected user");
      return;
    }

    const modal = getController("modal").getInstance();

    modal.open({
      title: "Delete user",
      content: `
        <div class="modal-body-user">
          <div>${this.selectedUser?.username}</div>
          <div class="modal-body-user-email">(${this.selectedUser?.email})</div>
        </div>`,
      footer: `
        <button class="btn btn-primary btn-wider-lg" data-action="confirm">Confirm</button>
        <button class="btn btn-primary btn-wider-lg" data-action="cancel">Cancel</button>
      `,
      actions: {
        confirm: async () => {
          const userId = this.selectedUser?.id;

          // Fields data validation
          if (!userId) {
            logger.warn("AdminPanelController.deleteUser: no user id");
            return;
          }

          const token = localStorage.getItem("auth_token");
          const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          this.selectedUser = null;
          this.updateActionButtons();
          modal.close();

          if (!res.ok) {
            const error = await res.json();
            logger.error("AdminPanelController.deleteUser: server error", {
              status: res.status,
              message: error,
            });
            return;
          }

          await this.loadUsers();
          this.renderUsers();
        },
        cancel: () => {
          this.selectedUser = null;
          this.updateActionButtons();
          modal.close();
        },
      },
    });
  }

  async createTicket() {
    const modal = getController("modal").getInstance();
    const content = await (
      await fetch("../components/forms/ticket-create.form.html")
    ).text();

    modal.open({
      title: "New Ticket",
      content,
      footer: `
        <button class="btn btn-primary btn-wider-lg" data-action="save">Save</button>
        <button class="btn btn-primary btn-wider-lg" data-action="cancel">Cancel</button>
      `,
      actions: {
        save: async () => {
          const data = modal.getFormData();

          const title = data?.["modal-form-ticket-create-title"];
          const description = data?.["modal-ticket-create-description"];
          const priority = data?.["modal-ticket-create-priority-slider"];

          // Fields data validation
          if (!title || !priority) {
            logger.warn(
              "AdminPanelController.createTicket: missing required fields",
              {
                title,
                priority,
              },
            );
            this.selectedTicket = null;
            this.updateActionButtons();
            modal.close();
            return;
          }

          const token = localStorage.getItem("auth_token");
          const res = await fetch(`${API_BASE_URL}/tickets`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title,
              description,
              priority,
            }),
          });

          this.selectedTicket = null;
          this.updateActionButtons();
          modal.close();

          if (!res.ok) {
            const error = await res.json();
            logger.error("AdminPanelController.createTicket: server error", {
              status: res.status,
              message: error,
            });
            return;
          }

          await this.loadTickets();
          this.renderTickets();
        },

        cancel: () => {
          this.selectedTicket = null;
          this.updateActionButtons();
          modal.close();
        },
      },
    });

    // Ticket data injection
    setTimeout(() => {
      const modalElem = document.querySelector('[data-js="modal-container"]');

      const slider = modalElem.querySelector(
        '[data-js="modal-ticket-create-priority-slider"]',
      );
      const bubble = modalElem.querySelector("[data-slider-value]");

      const updateBubble = () => {
        const value = Number(slider.value);
        const min = Number(slider.min);
        const max = Number(slider.max);

        const percent = (value - min) / (max - min);

        const sliderWidth = slider.offsetWidth;
        const offset = percent * (sliderWidth - 14) + 7;

        bubble.textContent = value;
        bubble.style.left = `${offset}px`;
      };

      slider.addEventListener("input", updateBubble);
      updateBubble();
    }, 0);
  }

  async updateTicket() {
    if (!this.selectedTicket) {
      logger.warn("AdminPanelController.updateTicket: no selected ticket");
      return;
    }

    const modal = getController("modal").getInstance();
    const content = await (
      await fetch("/components/forms/ticket-update.form.html")
    ).text();

    modal.open({
      title: "Edit ticket",
      content,
      footer: `
        <button class="btn btn-primary btn-wider-lg" data-action="save">Save</button>
        <button class="btn btn-primary btn-wider-lg" data-action="cancel">Cancel</button>
      `,
      actions: {
        save: async () => {
          const data = modal.getFormData();
          const title = data?.["modal-form-ticket-update-title"];
          const description = data?.["modal-form-ticket-update-description"];
          const priority = data?.["modal-form-ticket-update-priority-slider"];
          const status = data?.["modal-form-ticket-status"];

          // Fields data validation
          if (!title || !priority) {
            logger.warn(
              "AdminPanelController.updateTicket: missing required fields",
              {
                title,
                priority,
              },
            );
            return;
          }

          const token = localStorage.getItem("auth_token");
          const res = await fetch(
            `${API_BASE_URL}/tickets/${this.selectedTicket?.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                title,
                description,
                priority,
                status,
              }),
            },
          );

          if (!res.ok) {
            const error = await res.json();
            logger.error("AdminPanelController.updateTicket: server error", {
              status: res.status,
              message: error,
            });
          }

          this.selectedTicket = null;
          this.updateActionButtons();
          modal.close();
          await this.loadTickets();
          this.renderTickets();
        },
        cancel: () => {
          this.selectedTicket = null;
          this.updateActionButtons();
          modal.close();
        },
      },
    });

    // Ticket data injection
    const modalElem = document.querySelector('[data-js="modal-container"]');

    modalElem.querySelector(
      '[data-js="modal-form-ticket-update-title"]',
    ).value = this.selectedTicket.title;
    modalElem.querySelector(
      '[data-js="modal-form-ticket-update-description"]',
    ).value = this.selectedTicket.description;
    const slider = modalElem.querySelector(
      '[data-js="modal-form-ticket-update-priority-slider"]',
    );
    const bubble = modalElem.querySelector(
      '[data-js="modal-form-ticket-update-priority-slider-bubble"]',
    );
    const selectOptionStatus = modalElem.querySelector(
      '[data-js="modal-form-ticket-status"]',
    );

    // Statuses dynamic select options build
    const token = localStorage.getItem("auth_token");
    if (!token) return null;

    const res = await fetch(`${API_BASE_URL}/statuses`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const statuses = await res.json();

    if (!res.ok) {
      const error = await res.json();
      logger.error(
        "AdminPanelController.updateTicket: error fetching statuses",
        {
          status: res.status,
          message: error,
        },
      );
    }

    statuses.forEach((status) => {
      const option = document.createElement("option");
      option.value = status.name;
      option.textContent = formatStatus(status.name);
      selectOptionStatus.append(option);
    });
    selectOptionStatus.value = this.selectedTicket.status;

    // Priority bubble update and positioning
    const updateBubble = () => {
      const value = Number(slider.value);
      const min = Number(slider.min);
      const max = Number(slider.max);

      const percent = (value - min) / (max - min);

      const sliderWidth = slider.offsetWidth;
      const offset = percent * (sliderWidth - 14) + 7;

      bubble.textContent = value;
      bubble.style.left = `${offset}px`;
    };

    slider.value = this.selectedTicket.priority;
    bubble.textContent = this.selectedTicket.priority;

    slider.addEventListener("input", updateBubble);

    updateBubble();
  }

  async deleteTicket() {
    if (!this.selectedTicket) {
      logger.warn("AdminPanelController.deleteTicket: no selected ticket");
      return;
    }

    const modal = getController("modal").getInstance();

    modal.open({
      title: "Delete ticket",
      content: `
        <div class="modal-body-ticket">
          <div>${this.selectedTicket?.id}</div>
          <div>${this.selectedTicket?.title}</div>
        </div>`,
      footer: `
        <button class="btn btn-primary btn-wider-lg" data-action="confirm">Confirm</button>
        <button class="btn btn-primary btn-wider-lg" data-action="cancel">Cancel</button>
      `,
      actions: {
        confirm: async () => {
          const ticketId = this.selectedTicket?.id;

          // Fields data validation
          if (!ticketId) {
            logger.warn("AdminPanelController.deleteTicket: no ticket id");
            return;
          }

          const token = localStorage.getItem("auth_token");
          const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          this.selectedTicket = null;
          this.updateActionButtons();
          modal.close();

          if (!res.ok) {
            const error = await res.json();
            logger.error("AdminPanelController.deleteTicket: server error", {
              status: res.status,
              message: error,
            });
            return;
          }

          await this.loadTickets();
          this.renderTickets();
        },
        cancel: () => {
          this.selectedTicket = null;
          this.updateActionButtons();
          modal.close();
        },
      },
    });
  }

  async createCategory() {
    const modal = getController("modal").getInstance();
    const content = await (
      await fetch("../components/forms/category-create.form.html")
    ).text();

    modal.open({
      title: "New category",
      content,
      footer: `
        <button class="btn btn-primary btn-wider-lg" data-action="save">Save</button>
        <button class="btn btn-primary btn-wider-lg" data-action="cancel">Cancel</button>
      `,
      actions: {
        save: async () => {
          const data = modal.getFormData();

          const name = data?.["modal-category-create-name"];

          // Fields data validation
          if (!name) {
            logger.warn(
              "AdminPanelController.createCategory: missing name field",
              {
                name,
              },
            );
            return;
          }

          const token = localStorage.getItem("auth_token");
          const res = await fetch(`${API_BASE_URL}/categories`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name,
            }),
          });

          this.selectedCategory = null;
          this.updateActionButtons();
          modal.close();

          if (!res.ok) {
            const error = await res.json();
            logger.error("AdminPanelController.createCategory: server error", {
              status: res.status,
              message: error,
            });
            return;
          }

          await this.loadCategories();
          this.renderCategories();
        },

        cancel: () => {
          this.selectedCategory = null;
          this.updateActionButtons();
          modal.close();
        },
      },
    });
  }

  async updateCategory() {
    if (!this.selectedCategory) {
      logger.warn("AdminPanelController.updateCategory: no selected category");
      return;
    }

    const modal = getController("modal").getInstance();
    const content = await (
      await fetch("/components/forms/category-update.form.html")
    ).text();

    modal.open({
      title: "Edit category",
      content,
      footer: `
        <button class="btn btn-primary btn-wider-lg" data-action="save">Save</button>
        <button class="btn btn-primary btn-wider-lg" data-action="cancel">Cancel</button>
      `,
      actions: {
        save: async () => {
          const data = modal.getFormData();

          const name = data?.["modal-category-update-name"];

          // Fields data validation
          if (!name) {
            logger.warn(
              "AdminPanelController.updateCategory: missing required fields",
              {
                name,
              },
            );
            return;
          }

          const token = localStorage.getItem("auth_token");
          const res = await fetch(
            `${API_BASE_URL}/categories/${this.selectedCategory?.id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                name,
              }),
            },
          );

          if (!res.ok) {
            const error = await res.json();
            logger.error("AdminPanelController.updateCategory: server error", {
              status: res.status,
              message: error,
            });
          }

          this.selectedCategory = null;
          this.updateActionButtons();
          modal.close();
          await this.loadCategories();
          this.renderCategories();
        },
        cancel: () => {
          this.selectedCategory = null;
          this.updateActionButtons();
          modal.close();
        },
      },
    });

    // User data injection
    const modalElem = document.querySelector('[data-js="modal-container"]');

    modalElem.querySelector('[data-js="modal-category-update-name"]').value =
      this.selectedCategory.name;
  }

  async deleteCategory() {
    if (!this.selectedCategory) {
      logger.warn("AdminPanelController.deleteCategory: no selected category");
      return;
    }

    const modal = getController("modal").getInstance();

    modal.open({
      title: "Delete category",
      content: `
        <div class="modal-body-category">
          <div>(#${this.selectedCategory?.id}) ${this.selectedCategory?.name}</div>
        </div>`,
      footer: `
        <button class="btn btn-primary btn-wider-lg" data-action="confirm">Confirm</button>
        <button class="btn btn-primary btn-wider-lg" data-action="cancel">Cancel</button>
      `,
      actions: {
        confirm: async () => {
          const categoryId = this.selectedCategory?.id;

          // Fields data validation
          if (!categoryId) {
            logger.warn("AdminPanelController.deleteCategory: no category id");
            return;
          }

          const token = localStorage.getItem("auth_token");
          const res = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          this.selectedCategory = null;
          this.updateActionButtons();
          modal.close();

          if (!res.ok) {
            const error = await res.json();
            logger.error("AdminPanelController.deleteCategory: server error", {
              status: res.status,
              message: error,
            });
            return;
          }

          await this.loadCategories();
          this.renderCategories();
        },
        cancel: () => {
          this.selectedCategory = null;
          this.updateActionButtons();
          modal.close();
        },
      },
    });
  }
}

registerController("admin-panel", AdminPanelController);

export default AdminPanelController;
