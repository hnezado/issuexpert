import { API_BASE_URL } from "../config.js";
import { goTo } from "../core/router.js";
import { fetchCurrentUser } from "../auth/user.js";
import { logger } from "../core/logger.js";
import {
  getController,
  registerController,
} from "../core/controller-registry.js";
import { cleanUsername } from "../../utils/user.js";
import { formatText } from "../../utils/general.js";
import { getPriorityStr, formatPriority } from "../../utils/tickets.js";
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
    this.currentUser = null;
    this.users = [];
    this.elements = {};
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
    this.updateActionButtons();
    this.bindEvents();

    this.isInitialized = true;
  }

  gatherElements() {
    if (!this.rootElem) {
      logger.error("AdminPanelController: rootElem is missing");
      return;
    }

    // Users
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
      logger.warn("AdminPanelController.renderUsers: no current user found", {
        currentUser: this.currentUser,
      });
      return;
    }

    // Table injection
    if (!this.elements.usersTableBody?.elem) return;

    this.users?.forEach((user) => {
      const row = document.createElement("div");
      row.classList.add("row");
      row.dataset.js = "admin-panel-users-table-row";
      row.dataset.id = user.id;

      row.innerHTML = `
        <div class="cell" data-label="ID">${user.id}</div>
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
      logger.warn("AdminPanelController.renderTickets: no current user found", {
        currentUser: this.currentUser,
      });
      return;
    }

    // Table injection
    if (!this.elements.ticketsTableBody?.elem) return;

    this.tickets?.forEach((ticket) => {
      const row = document.createElement("div");
      row.classList.add("row");
      row.dataset.js = "admin-panel-tickets-table-row";
      row.dataset.id = ticket.id;

      row.innerHTML = `
        <div class="cell" data-label="ID">${ticket.id}</div>
        <div class="cell" data-label="Title">${ticket.title}</div>
        <div class="cell hide-750" data-label="Description">${ticket.description}</div>
        <div class="cell hide-500 priority-${getPriorityStr(ticket.priority)}" data-label="Priority">${formatPriority(ticket.priority)}</div>
        <div class="cell hide-600" data-label="Status">${ticket.status}</div>
        <div class="cell" data-label="Created by">${formatDate(ticket.created_at)}</div>
        <div class="cell hide-900" data-label="Last modified">${formatDate(ticket.updated_at)}</div>
      `;

      this.elements.ticketsTableBody?.elem.appendChild(row);
    });
  }

  renderCategories() {
    if (!this.currentUser) {
      logger.warn(
        "AdminPanelController.renderCategories: no current user found",
        {
          currentUser: this.currentUser,
        },
      );
      return;
    }

    // Table injection
    if (!this.elements.categoriesTableBody?.elem) return;

    this.categories?.forEach((category) => {
      const row = document.createElement("div");
      row.classList.add("row");
      row.dataset.js = "admin-panel-categories-table-row";
      row.dataset.id = category.id;

      row.innerHTML = `
        <div class="cell" data-label="ID">${category.id}</div>
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

  handleTableClick(e) {
    const table = e.target.closest(".table-body[data-name]");
    console.log("table clicked:", table);
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
      console.log("selectedUser:", this.selectedUser);
    } else if (tableName === "tickets") {
      if (alreadySelected) {
        this.selectedTicket = null;
      } else {
        this.selectedTicket = this.tickets.find((t) => t.id === rowId);
      }
      console.log("selectedTicket:", this.selectedTicket);
    } else if (tableName === "categories") {
      if (alreadySelected) {
        this.selectedCategory = null;
      } else {
        this.selectedCategory = this.categories.find((c) => c.id === rowId);
      }
      console.log("selectedCategory:", this.selectedCategory);
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
      await fetch("/components/forms/user-create.form.html")
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
          const role_id = Number(data?.["modal-user-create-role"]);

          // Fields data validation
          if (!username || !email || !password || !role_id) {
            logger.warn(
              "AdminPanelController.createUser: missing required fields",
              {
                username,
                email,
                password,
                role_id,
              },
            );
            return;
          }
          if (!isValidUsername(cleanUsername(username))) {
            logger.warn("AdminPanelController.createUser: invalid username");
            return;
          }
          if (!isValidEmail(email)) {
            logger.warn("AdminPanelController.createUser: invalid email");
            return;
          }
          if (!isValidPassword(password)) {
            logger.warn("AdminPanelController.createUser: invalid password");
            return;
          }
          if (![1, 2, 3].includes(role_id)) {
            logger.warn("AdminPanelController.createUser: invalid role_id");
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
              role_id,
            }),
          });

          modal.close();

          if (!res.ok) {
            const errorData = await res.json();
            logger.error(
              `AdminPanelController.createUser: error creating user`,
              {
                status: res.status,
                message: errorData.message,
              },
            );
            return;
          }

          await this.loadUsers();
          this.renderUsers();
        },

        cancel: () => modal.close(),
      },
    });
  }

  async updateUser() {
    if (!this.selectedUser) {
      logger.warn("AdminPanelController.updateUser: no user selected", {
        selectedUser: this.selectedUser,
      });
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
          let role_id = data?.["modal-user-update-role"];

          // Fields data validation
          if (!username || !email || !role_id) {
            logger.warn("AdminPanelController: missing required fields", {
              username,
              email,
              role_id,
            });
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
                role_id,
              }),
            },
          );

          if (!res.ok) {
            const errorData = await res.json();
            logger.error(`AdminPanelController: ${errorData.message}`, {
              status: res.status,
              message: errorData.message,
            });
          }

          modal.close();
          await this.loadUsers();
          this.renderUsers();
        },
        cancel: () => modal.close(),
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
      input.checked = Number(input.value) === this.selectedUser.role_id;
    });
  }

  async deleteUser() {
    if (!this.selectedUser) {
      logger.warn("AdminPanelController: no user selected", {
        selectedUser: this.selectedUser,
      });
      return;
    }

    const modal = getController("modal").getInstance();
    const content = await (
      await fetch("/components/forms/user-update.form.html")
    ).text();

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
          const id = this.selectedUser?.id;

          // Fields data validation
          if (!id) {
            logger.warn("AdminPanelController: missing user id", {
              selectedUserId: this.selectedUser?.id,
            });
            return;
          }

          const token = localStorage.getItem("auth_token");
          const res = await fetch(
            `${API_BASE_URL}/users/${this.selectedUser?.id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (!res.ok) {
            const errorData = await res.json();
            logger.error(`AdminPanelController: ${errorData.message}`, {
              status: res.status,
              message: errorData.message,
            });
          }

          modal.close();
          await this.loadUsers();
          this.renderUsers();
        },
        cancel: () => modal.close(),
      },
    });
  }
}

registerController("admin-panel", AdminPanelController);

export default AdminPanelController;
