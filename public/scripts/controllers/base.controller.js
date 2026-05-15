class BaseController {
  constructor() {
    this.rootElem = null;

    this.elements = {};
    this.events = [];
    this.boundEvents = [];

    this.isInitialized = false;
  }

  async init(rootElem) {
    if (this.isInitialized) this.destroy();

    this.rootElem = rootElem;

    this.gatherElements();
    this.bindEvents();

    this.isInitialized = true;
  }

  gatherElements() {
    // ONLY DOM queries
  }

  bindEvents() {
    this._boundEvents = [];

    this.events.forEach(({ el, type, handler }) => {
      const node = typeof el === "function" ? el() : el;
      if (!node) return;

      node.addEventListener(type, handler);
      this._boundEvents.push({ node, type, handler });
    });
  }

  destroy() {
    this._boundEvents.forEach(({ node, type, handler }) => {
      node.removeEventListener(type, handler);
    });

    this._boundEvents = [];
    this.elements = {};
    this.rootElem = null;
    this.isInitialized = false;
  }
}
