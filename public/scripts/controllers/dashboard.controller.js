import { API_BASE_URL } from "../config.js";
import { logger } from "../core/logger.js";
import {
  getController,
  registerController,
} from "../core/controller-registry.js";
import { goTo } from "../core/router.js";
import { fetchCurrentUser } from "../auth/user.js";
import { formatText } from "../../utils/general.js";
import { formatDate } from "../../utils/date.js";
import {
  STATUSES,
  getPriorityStr,
  formatPriority,
  formatStatus,
  getPriorityKey,
  PRIORITIES,
  formatTicketListName,
} from "../../utils/tickets.js";
import { beautifyUsername } from "../../utils/user.js";
import { Toast } from "../core/toast.js";

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
    this.unassignedTickets = [];
    this.assignedTickets = [];
    this.activeTicketsList = [];
    this.ticketsFiltered = [];

    this.activeTicketsListName;
    this.filters = {
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

    this.setActiveList("owned-tickets");
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
      itemCount: this.rootElem.querySelector(
        '[data-js="dashboard-header-items-count"]',
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

  async loadTickets() {
    await this.loadUnassignedTickets();
    await this.loadAssignedTickets();
    await this.loadOwnedTickets();
  }

  async loadUnassignedTickets() {
    if (!this.currentUser) return;

    const { id, role } = this.currentUser;

    const isAdmin = this.currentUser.role === "admin";
    const isTech = this.currentUser.role === "technician";
    if (!isAdmin && !isTech) return;

    const token = localStorage.getItem("auth_token");
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/tickets/unassigned`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      this.unassignedTickets = data.data;
    } catch (error) {
      logger.error(
        "AdminPanelController.loadUnassignedTickets: error loading unassigned tickets",
        {
          error,
        },
      );
    }
  }

  async loadAssignedTickets() {
    if (!this.currentUser) return;

    const { id, role } = this.currentUser;

    const isAdmin = this.currentUser.role === "admin";
    const isTech = this.currentUser.role === "technician";
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

  bindEvents() {
    if (!this.rootElem) return;

    this.elements.filterSearchInput?.addEventListener("input", () => {
      this.addFilter("search", this.elements.filterSearchInput?.value);
    });

    this.elements.filterStatusSelect?.addEventListener("change", () => {
      this.addFilter("status", this.elements.filterStatusSelect?.value);
      this.elements.filterStatusSelect.blur();
    });

    this.elements.filterPrioritySelect?.addEventListener("change", () => {
      this.addFilter("priority", this.elements.filterPrioritySelect?.value);
      this.elements.filterPrioritySelect.blur();
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

    // Event delegation for ticket list interactions
    this.elements.ticketList?.addEventListener("click", async (e) => {
      // Handle assign/unassign buttons
      const assignBtn = e.target.closest(
        '[data-js="dashboard-ticket-card-footer-users-assigned-btn-assign"]',
      );
      const unassignBtn = e.target.closest(
        '[data-js="dashboard-ticket-card-footer-users-assigned-btn-unassign"]',
      );

      if (assignBtn || unassignBtn) {
        e.stopPropagation();

        const ticketId = (assignBtn || unassignBtn)?.dataset.id;
        const ticket = this.ticketsFiltered.find(
          (t) => String(t.id) === String(ticketId),
        );

        if (!ticketId || !ticket) return;

        const isAdmin = this.currentUser.role === "admin";
        const isTech = this.currentUser.role === "technician";
        const isSelfAssigned = ticket.assigned_to === this.currentUser.id;

        if (assignBtn) {
          if (isAdmin || isTech) {
            await this.assignTicket(ticketId);
          }
        } else if (unassignBtn) {
          if (isAdmin || (isTech && isSelfAssigned)) {
            await this.unassignTicket(ticketId);
          }
        }

        return;
      }

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

    this.elements.itemCount.textContent = `Showing ${this.ticketsFiltered.length} tickets`;

    this.updateButtons();
  }

  updateButtons() {
    // Filters
    if (this.elements.filterSearchInput) {
      this.elements.filterSearchInput.classList.toggle(
        "active",
        this.filters.search.length > 0,
      );
    }
    if (this.elements.filterStatusSelect) {
      this.elements.filterStatusSelect.classList.toggle(
        "active",
        this.filters.status !== "all",
      );
    }
    if (this.elements.filterPrioritySelect) {
      this.elements.filterPrioritySelect.classList.toggle(
        "active",
        this.filters.priority !== "all",
      );
    }

    // CRUD
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

    this.updateButtons();
  }

  getTicketCard(ticket) {
    const isAdmin = this.currentUser.role === "admin";
    const isTech = this.currentUser.role === "technician";

    const isAssigned = !!ticket.assigned_to_username;
    const isCreator = ticket.created_by === this.currentUser.id;
    const isSelfAssigned = ticket.assigned_to === this.currentUser.id;

    const assignedUser = ticket.assigned_to_username
      ? `<span class="dashboard-ticket-card-footer-users-assigned-value
      ${isSelfAssigned ? "self-assigned" : ""}"
      ${isSelfAssigned ? 'title="Ticket assigned to me"' : ""}">
        ${isSelfAssigned ? "➤ Me" : beautifyUsername(ticket.assigned_to_username)}
      </span>`
      : `<span class="dashboard-ticket-card-footer-users-assigned-value unassigned ${isSelfAssigned ? "self" : ""}">
        Unassigned
      </span>`;

    const assignBtn =
      !isAssigned && (isAdmin || isTech)
        ? `
        <button
          class="btn btn-clean btn-mini dashboard-ticket-card-footer-users-assigned-btn-assign"
          data-js="dashboard-ticket-card-footer-users-assigned-btn-assign"
          data-id="${ticket.id}"
          title="Assign ticket to me"
        >
          <svg width="256px" height="256px" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 20V19C4 16.2386 6.23858 14 9 14H12.75M17.5355 13.9645V17.5M17.5355 17.5V21.0355M17.5355 17.5H21.0711M17.5355 17.5H14M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z"/>
          </svg>
        </button>
      `
        : "";

    const unassignBtn =
      isAssigned && (isAdmin || (isTech && isSelfAssigned))
        ? `
        <button
          class="btn btn-clean btn-mini dashboard-ticket-card-footer-users-assigned-btn-unassign"
          data-js="dashboard-ticket-card-footer-users-assigned-btn-unassign"
          data-id="${ticket.id}"
          title="${isSelfAssigned ? "Unassign ticket from me" : "Unassign ticket from " + beautifyUsername(ticket.assigned_to_username)}"
        >
          <svg width="256px" height="256px" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 20V19C4 16.2386 6.23858 14 9 14H12.75M16 15L18.5 17.5M18.5 17.5L21 20M18.5 17.5L21 15M18.5 17.5L16 20M15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z"/>
          </svg>
        </button>
      `
        : "";

    return `
      <div class="dashboard-ticket-card-header">
        ${this.isNewTicket(ticket) ? `<span class="dashboard-ticket-card-header-badge-new">NEW</span>` : ""}
        
        <span class="dashboard-ticket-card-header-id">#${ticket.id}</span>

        <span class="dashboard-ticket-card-header-priority priority-${getPriorityStr(ticket.priority)}">
          ${formatPriority(ticket.priority, true)}
        </span>

        <span class="dashboard-ticket-card-header-status status-${ticket.status.replace("_", "-")}">
          ${formatStatus(ticket.status).toUpperCase()}
        </span>
      </div>

      <div class="dashboard-ticket-card-body">
        <div class="dashboard-ticket-card-body-title">${ticket.title}</div>
        <div class="dashboard-ticket-card-body-description">${ticket.description || ""}</div>
      </div>

      <div class="dashboard-ticket-card-footer">
        <div class="dashboard-ticket-card-footer-date">
          <div class="dashboard-ticket-card-footer-date-updated">
            <span>Last modified:</span>
            <span class="dashboard-ticket-card-footer-date-updated-value">${formatDate(ticket.updated_at, true)}</span>
          </div>
        </div>

        <div class="dashboard-ticket-card-footer-users">
          <div class="dashboard-ticket-card-footer-users-created">
            <span class="dashboard-ticket-card-footer-users-created-label">Author:</span>
            <span class="dashboard-ticket-card-footer-users-created-value ${isCreator ? "creator" : ""}" ${isCreator ? 'title="Ticket created by me"' : ""}>
              ${isCreator ? "➤ Me" : beautifyUsername(ticket.created_by_username)}
            </span>
          </div>

          <div class="dashboard-ticket-card-footer-users-assigned">
            <span class="dashboard-ticket-card-footer-users-created-label">${isAssigned ? "Assigned:" : ""}</span>
            ${assignedUser}
            ${assignBtn}
            ${unassignBtn}
          </div>
        </div>
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
    this.updateActiveList();
  }

  updateActiveList() {
    if (!this.currentUser) return;
    const isAdmin = this.currentUser.role === "admin";
    const isTech = this.currentUser.role === "technician";
    const isUser = this.currentUser.role === "user";

    if (isUser && this.activeTicketsListName !== "owned-tickets") return;

    if (this.activeTicketsListName === "all-tickets") {
      if (isAdmin || isTech) {
        this.activeTicketsList = [
          ...new Map(
            [
              ...this.unassignedTickets,
              ...this.assignedTickets,
              ...this.ownedTickets,
            ].map((t) => [t.id, t]),
          ).values(),
        ].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      } else if (isUser) {
        this.activeTicketsList = [...this.ownedTickets].sort(
          (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
        );
      }
    } else if (this.activeTicketsListName === "unassigned-tickets") {
      this.activeTicketsList = [...this.unassignedTickets].sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
      );
    } else if (this.activeTicketsListName === "assigned-tickets") {
      this.activeTicketsList = [...this.assignedTickets].sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
      );
    } else if (this.activeTicketsListName === "owned-tickets") {
      this.activeTicketsList = [...this.ownedTickets].sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
      );
    }

    this.resetFilters();
    this.applyFilters();
  }

  resetFilters() {
    this.filters = { search: "", status: "all", priority: "all" };
    this.elements.filterSearchInput.value = "";
    this.renderHeader();
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
    this.updateButtons();
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

    this.updateButtons();
  }

  resetSelectedTicket() {
    if (this.selectedTicketElem) {
      this.selectedTicketElem.removeAttribute("data-selected");
    }

    this.selectedTicket = null;
    this.selectedTicketElem = null;

    this.updateButtons();
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
          const formData = modal.getFormData();

          const title = formData?.["modal-form-ticket-create-title"];
          const description = formData?.["modal-ticket-create-description"];
          const priority = formData?.["modal-ticket-create-priority-slider"];

          // Fields data validation
          if (!title || !priority) {
            logger.warn(
              "AdminPanelController.createTicket: missing required fields",
              {
                title,
                priority,
              },
            );
            Toast.error("Missing required fields");
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

          const data = await res.json();

          modal.close();

          if (!res.ok) {
            logger.error("AdminPanelController.createTicket: server error", {
              status: res.status,
              message: data.message,
            });
            Toast.error(data.message);
            return;
          }

          Toast.success(data.message);

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
      logger.warn("AdminPanelController.updateTicket: no ticket selected");
      Toast.warning("No ticket selected");
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
          const formData = modal.getFormData();
          const title = formData?.["modal-form-ticket-update-title"];
          const description =
            formData?.["modal-form-ticket-update-description"];
          const priority =
            formData?.["modal-form-ticket-update-priority-slider"];
          const status = formData?.["modal-form-ticket-status"];

          // Fields data validation
          if (!title || !priority) {
            logger.warn(
              "AdminPanelController.updateTicket: missing required fields",
              {
                title,
                priority,
              },
            );
            Toast.error("Missing required fields");
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

          const data = await res.json();

          if (!res.ok) {
            logger.error("AdminPanelController.updateTicket: server error", {
              status: res.status,
              message: data.message,
            });
            Toast.error(data.message);
            return;
          }

          Toast.success(data.message);

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

    const data = await res.json();
    const statuses = data.data;

    if (!res.ok) {
      logger.error(
        "AdminPanelController.updateTicket: error fetching statuses",
        {
          status: res.status,
          message: data.message,
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
      logger.warn("AdminPanelController.deleteTicket: no ticket selected");
      Toast.warning("No ticket selected");
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
      showRequiredFields: false,
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

          const data = await res.json();

          if (!res.ok) {
            logger.error("AdminPanelController.deleteTicket: server error", {
              status: res.status,
              message: data.message,
            });
            Toast.error(data.message);
            return;
          }

          Toast.success(data.message);

          modal.close();
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

    return diffMinutes <= 60 * 24; // 1 day
  }

  async assignTicket(ticketId) {
    if (!ticketId) {
      return;
    }

    // const assignedSelf = this.

    const token = localStorage.getItem("auth_token");
    if (!token) return null;

    const res = await fetch(`${API_BASE_URL}/tickets/assign/${ticketId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        assigned_to: this.currentUser.id,
      }),
    });
    if (!res.ok) {
      const error = await res.json();
      logger.error(
        "AdminPanelController.assignTicket: error assigning ticket",
        {
          status: res.status,
          message: error,
        },
      );
    }

    await this.loadTickets();
    this.updateActiveList();
  }

  async unassignTicket(ticketId) {
    if (!ticketId) {
      return;
    }
    const token = localStorage.getItem("auth_token");
    if (!token) return null;

    const res = await fetch(`${API_BASE_URL}/tickets/unassign/${ticketId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const error = await res.json();
      logger.error(
        "AdminPanelController.unassignTicket: error unassigning ticket",
        {
          status: res.status,
          message: error,
        },
      );
    }

    await this.loadTickets();
    this.updateActiveList();
  }
}

registerController("dashboard", DashboardController);

export default DashboardController;
