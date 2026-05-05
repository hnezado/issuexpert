import { registerController } from "../core/controller-registry.js";
import { logger } from "../core/logger.js";

/**
 * ModalController (singleton)
 * Manages global modal UI: open, close and dynamic content.
 */
class ModalController {
  static instance = null;

  // Singleton getter
  static getInstance() {
    if (!ModalController.instance) {
      ModalController.instance = new ModalController();
    }
    return ModalController.instance;
  }

  constructor() {
    // Root container element where this controller is mounted
    this.rootElem = null;

    // DOM elements used by the controller
    this.elements = {};

    // Dynamic actions for modal buttons
    this.actions = {};

    this.isOpen = false;
  }

  init(rootElem) {
    this.rootElem = rootElem;

    this.gatherElements();
    this.bindEvents();

    this.isOpen = false;
  }

  gatherElements() {
    if (!this.rootElem) {
      logger.error("ModalController: rootElem is missing");
      return;
    }

    this.elements.modalContainer = {
      elem: this.rootElem.querySelector('[data-js="modal-container"]'),
    };

    this.elements.overlay = {
      elem: this.rootElem.querySelector('[data-js="modal-overlay"]'),
      eventType: "click",
      handler: () => this.close(),
    };

    this.elements.closeBtn = {
      elem: this.rootElem.querySelector('[data-js="modal-close"]'),
      eventType: "click",
      handler: () => this.close(),
    };

    this.elements.title = {
      elem: this.rootElem.querySelector('[data-js="modal-title"]'),
    };

    this.elements.body = {
      elem: this.rootElem.querySelector('[data-js="modal-body"]'),
    };

    this.elements.footer = {
      elem: this.rootElem.querySelector('[data-js="modal-footer"]'),
    };

    const missing = Object.entries(this.elements)
      .filter(([_, v]) => !v.elem)
      .map(([k]) => k);

    if (missing.length) {
      logger.warn("ModalController: missing elements", { missing });
    }
  }

  bindEvents() {
    Object.values(this.elements)
      .filter((e) => e.elem && e.eventType && e.handler)
      .forEach((e) => {
        e.elem.addEventListener(e.eventType, e.handler);
      });

    // Handles modal button actions via data-action
    this.rootElem.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (!action) return;
      const handler = this.actions?.[action];
      if (handler) handler();
    });
  }

  destroy() {
    Object.values(this.elements)
      .filter((e) => e.elem && e.eventType && e.handler)
      .forEach((e) => {
        e.elem.removeEventListener(e.eventType, e.handler);
      });

    this.rootElem = null;
    this.elements = {};
    this.isOpen = false;
  }
  // Allows partial params ({title: "Modal"})
  // Default object ({}) prevents undefined errors
  open({ title = "", content = "", footer = "", actions = {} } = {}) {
    if (!this.elements.modalContainer?.elem) return;

    if (this.elements.title?.elem) {
      this.elements.title.elem.textContent = title;
    }

    if (this.elements.body?.elem) {
      this.elements.body.elem.innerHTML = content;
    }

    if (this.elements.footer?.elem) {
      this.elements.footer.elem.innerHTML = footer;
    }

    this.actions = actions;

    this.elements.modalContainer.elem.classList.remove("hidden");
    this.isOpen = true;
  }

  close() {
    if (!this.elements.modalContainer?.elem) return;

    this.elements.modalContainer.elem.classList.add("hidden");

    if (this.elements.body?.elem) {
      this.elements.body.elem.innerHTML = "";
    }

    this.isOpen = false;
  }

  // Extract all form values inside the modal
  getFormData() {
    const inputs = this.rootElem.querySelectorAll("input, select, textarea");
    const data = {};

    inputs.forEach((input) => {
      // Only extract the checked one
      if (input.type === "radio" && !input.checked) return;

      const key = input.dataset.js;
      if (!key) return;

      data[key] = input.value;
    });

    return data;
  }
}

registerController("modal", ModalController);

export default ModalController;
