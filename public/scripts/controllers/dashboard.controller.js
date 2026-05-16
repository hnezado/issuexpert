import { API_BASE_URL } from "../config.js";
import { logger } from "../core/logger.js";
import { formatText } from "../../utils/general.js";
import { formatDate } from "../../utils/date.js";
import {
  getController,
  registerController,
} from "../core/controller-registry.js";
import { goTo } from "../core/router.js";
import { fetchCurrentUser } from "../auth/user.js";
import {
  STATUSES,
  getPriorityStr,
  formatPriority,
  formatStatus,
  getPriorityKey,
  PRIORITIES,
  formatTicketListName,
} from "../../utils/tickets.js";

/**
 * Dashboard Controller
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
    this.rootElem = null;
    this.isInitialized = false;
    this.pendingActions = [];
    this.currentUser = null;

    this.elements = {};
    this.handlers = {};

    this.ownedTickets = [];
    this.assignedTickets = [];
    this.activeTicketsList = [];
    this.ticketsFiltered = [];

    this.activeTicketsListName;
    this.filters = this.filters = {
      search: "",
      status: "all",
      priority: "all",
    };

    this.selectedTicket = null;
    this.selectedTicketElem = null;
  }

  async init(rootElem) {
    if (this.isInitialized) this.destroy();

    this.rootElem = rootElem;

    this.gatherElements();

    await this.loadUser();
    await this.loadTickets();

    this.bindEvents();

    this.renderHeader();
    this.renderTickets();

    this.isInitialized = true;
  }

  gatherElements() {
    this.elements = {
      listTitle: this.rootElem.querySelector(
        '[data-js="dashboard-header-title"]',
      ),
      filterSearchInput: this.rootElem.querySelector(
        '[data-js="dashboard-header-actions-filters-search-input"]',
      ),
      filterStatusSelect: this.rootElem.querySelector(
        '[data-js="dashboard-header-actions-filters-status-select"]',
      ),
      filterPrioritySelect: this.rootElem.querySelector(
        '[data-js="dashboard-header-actions-filters-priority-select"]',
      ),
      ticketList: this.rootElem.querySelector(
        '[data-js="dashboard-ticket-list"]',
      ),
      createTicketBtn: this.rootElem.querySelector([
        '[data-js="dashboard-header-actions-btn-create"]',
      ]),
      updateTicketBtn: this.rootElem.querySelector([
        '[data-js="dashboard-header-actions-btn-update"]',
      ]),
      deleteTicketBtn: this.rootElem.querySelector([
        '[data-js="dashboard-header-actions-btn-delete"]',
      ]),
    };
  }

  async loadUser() {
    this.currentUser = await fetchCurrentUser();
    if (!this.currentUser) return;
  }

  bindEvents() {
    if (!this.rootElem) return;

    this.elements.filterSearchInput?.addEventListener("input", () => {
      this.addFilter("search", this.elements.filterSearchInput?.value);
      this.applyFilters();
    });

    this.elements.filterStatusSelect?.addEventListener("change", () => {
      this.addFilter("status", this.elements.filterStatusSelect?.value);
      this.applyFilters();
    });

    this.elements.filterPrioritySelect?.addEventListener("change", () => {
      this.addFilter("priority", this.elements.filterPrioritySelect?.value);
      this.applyFilters();
    });

    this.elements.createTicketBtn?.addEventListener("click", () =>
      this.createTicket(),
    );
    this.elements.updateTicketBtn?.addEventListener("click", () =>
      this.updateTicket(),
    );
    this.elements.deleteTicketBtn?.addEventListener("click", () =>
      this.deleteTicket(),
    );

    this.elements.ticketList?.addEventListener("click", (e) => {
      const card = e.target.closest("[data-ticket-id]");
      if (!card) return;

      const ticketId = card.dataset.ticketId;
      if (!ticketId) return;

      const ticket = this.ticketsFiltered.find(
        (t) => String(t.id) === ticketId,
      );

      if (ticket) this.selectTicket(ticket, card);
    });
  }

  async loadTickets() {
    await this.loadOwnedTickets();
    await this.loadAssignedTickets();
  }

  async loadOwnedTickets() {
    if (!this.currentUser) return;

    const { id } = this.currentUser;

    const token = localStorage.getItem("auth_token");
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/tickets/created/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      this.ownedTickets = data.data;
    } catch (error) {
      logger.error(
        "AdminPanelController.loadOwnedTickets: error loading owned tickets",
        {
          error,
        },
      );
    }
  }

  async loadAssignedTickets() {
    if (!this.currentUser) return;

    const { id, role } = this.currentUser;

    const isAdmin = this.currentUser.role !== "admin";
    const isTech = this.currentUser.role !== "technician";
    if (!isAdmin && !isTech) return;

    const token = localStorage.getItem("auth_token");
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/tickets/assigned/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      this.assignedTickets = data.data;
    } catch (error) {
      logger.error(
        "AdminPanelController.loadAssignedTickets: error loading assigned tickets",
        {
          error,
        },
      );
    }
  }

  renderHeader() {
    this.elements.listTitle.textContent = formatTicketListName(
      this.activeTicketsListName,
    );

    // Clear selects before re-render
    this.elements.filterStatusSelect.innerHTML = `<option value="all" selected>
    All statuses</option>`;
    this.elements.filterPrioritySelect.innerHTML = `<option value="all" selected>All priorities</option>`;

    Object.values(STATUSES).forEach((status) => {
      const option = document.createElement("option");
      option.text = formatStatus(status);
      option.value = status;
      this.elements.filterStatusSelect.append(option);
    });

    Object.entries(PRIORITIES)
      .filter(([key]) => key !== "invalid")
      .forEach(([key, priority]) => {
        const option = document.createElement("option");
        option.text = priority.label;
        option.value = key;
        this.elements.filterPrioritySelect.append(option);
        this.elements.filterPrioritySelect;
      });

    this.updateActionButtons();
  }

  updateActionButtons() {
    if (this.elements.updateTicketBtn) {
      this.elements.updateTicketBtn.disabled = !this.selectedTicketElem;
    }

    if (this.elements.deleteTicketBtn) {
      this.elements.deleteTicketBtn.disabled = !this.selectedTicketElem;
    }
  }

  renderTickets() {
    const container = this.rootElem.querySelector(
      '[data-js="dashboard-ticket-list"]',
    );

    if (!container) return;

    container.innerHTML = "";
    this.ticketsFiltered.forEach((ticket) => {
      const card = document.createElement("div");
      card.classList.add("dashboard-ticket-card");
      card.dataset.ticketId = ticket.id;
      card.innerHTML = this.getTicketCard(ticket);
      container.appendChild(card);
    });
  }

  getTicketCard(ticket) {
    return `
      <div class="dashboard-ticket-card-top" data-js="ticket-card">
        ${this.isNewTicket(ticket) ? `<span class="badge-new">NEW</span>` : ""}
        <span class="dashboard-ticket-card-id" data-js="ticket-card-id">#${ticket.id}</span>
        <span class="dashboard-ticket-card-status status-${ticket.status}">
          ${ticket.status.toUpperCase()}
        </span>
      </div>

      <div class="dashboard-ticket-card-title">
        ${ticket.title}
      </div>

      <div class="dashboard-ticket-card-description">
        ${ticket.description || ""}
      </div>

      <div class="dashboard-ticket-card-bottom">
        <span class="dashboard-ticket-card-priority priority-${getPriorityStr(ticket.priority)}">
          ${formatPriority(ticket.priority)}
        </span>
        <span class="dashboard-ticket-card-created">
          Created by: #${ticket.created_by}
        </span>
        <span class="dashboard-ticket-card-assigned">
          ${ticket.assigned_to ? "Assigned to: #" + ticket.assigned_to : "Unassigned"}
        </span>
        <span class="dashboard-ticket-card-updated">
          ${formatDate(ticket.updated_at, true)}
        </span>
      </div>
    `;
  }

  destroy() {
    this.errorBtn?.removeEventListener("click", this.onErrorBtnClick);

    this.rootElem = null;

    this.isInitialized = false;
  }

  setActiveList(listName) {
    if (!this.isInitialized) return;

    this.activeTicketsListName = listName;
    this.renderHeader();
    this.updateActiveList();
  }

  updateActiveList() {
    if (!this.currentUser) return;
    const isUser = this.currentUser.role === "user";

    if (isUser && this.activeTicketsListName !== "owned-tickets") return;

    if (this.activeTicketsListName === "all-tickets") {
      this.activeTicketsList = [
        ...new Map(
          [...this.assignedTickets, ...this.ownedTickets].map((t) => [t.id, t]),
        ).values(),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (this.activeTicketsListName === "assigned-tickets") {
      this.activeTicketsList = [...this.assignedTickets];
    } else if (this.activeTicketsListName === "owned-tickets") {
      this.activeTicketsList = [...this.ownedTickets];
    }

    this.resetFilters();
    this.applyFilters();
  }

  resetFilters() {
    this.filters = { search: "", status: "all", priority: "all" };
  }

  addFilter(filter, value) {
    this.filters[filter] = String(value).toLowerCase();

    this.applyFilters();
  }

  removeFilter(filter) {
    if (filter === "search") {
      this.filters[filter] = "";
    } else {
      this.filters[filter] = "all";
    }

    this.applyFilters();
  }

  applyFilters() {
    let filteredList = [...this.activeTicketsList];

    const { search, status, priority } = this.filters;

    if (search) filteredList = this.filterList("search", search, filteredList);
    if (status && status !== "all")
      filteredList = this.filterList("status", status, filteredList);
    if (priority && priority !== "all")
      filteredList = this.filterList("priority", priority, filteredList);

    this.ticketsFiltered = [...filteredList];

    this.resetSelectedTicket();
    this.renderTickets();
  }

  filterList(filter, value, filteredList) {
    if (!filter || !value) return filteredList;

    // Filter by search bar value in title, description or id
    if (filter === "search") {
      return filteredList.filter(
        (ticket) =>
          ticket.title?.toLowerCase().includes(value) ||
          ticket.description?.toLowerCase().includes(value) ||
          String(ticket.id).includes(value),
      );
    }

    // Filter by status
    if (filter === "status") {
      return filteredList.filter((ticket) => ticket.status === value);
    }

    // Filter by priority
    if (filter === "priority") {
      return filteredList.filter(
        (ticket) => getPriorityKey(ticket.priority) === value,
      );
    }

    return filteredList;
  }

  selectTicket(ticket, cardElem) {
    if (!ticket || !cardElem) return;

    if (this.selectedTicket?.id === ticket.id) {
      this.resetSelectedTicket();
      return;
    }

    this.resetSelectedTicket();

    cardElem.setAttribute("data-selected", "true");

    this.selectedTicket = ticket;
    this.selectedTicketElem = cardElem;

    this.updateActionButtons();
  }

  resetSelectedTicket() {
    if (this.selectedTicketElem) {
      this.selectedTicketElem.removeAttribute("data-selected");
    }

    this.selectedTicket = null;
    this.selectedTicketElem = null;

    this.updateActionButtons();
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
          this.updateActiveList();
        },

        cancel: () => modal.close(),
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

          modal.close();
          await this.loadTickets();
          this.updateActiveList();
        },
        cancel: () => modal.close(),
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
          <span>#${this.selectedTicket?.id}</span>&nbsp;➜&nbsp;
          <span>${this.selectedTicket?.title}</span>
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
          this.updateActiveList();
        },
        cancel: () => modal.close(),
      },
    });
  }

  isNewTicket(ticket) {
    if (!ticket?.created_at) return false;

    const created = new Date(ticket.created_at);
    const now = new Date();

    const diffMinutes = (now - created) / (1000 * 60);

    return diffMinutes <= 60; // 1 hour
  }
}

registerController("dashboard", DashboardController);

export default DashboardController;
