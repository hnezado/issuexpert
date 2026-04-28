import { goTo } from "../core/router.js";

class ErrorController {
  static instance = null;

  // Singleton getter
  static getInstance() {
    if (!ErrorController.instance) {
      ErrorController.instance = new ErrorController();
    }
    return ErrorController.instance;
  }

  constructor() {
    if (ErrorController.instance) return ErrorController.instance;

    this.backBtn = null;

    this.isInitialized = false;

    this.onBackBtnClick = () => goTo("dashboard");

    ErrorController.instance = this;
  }

  init(rootElem) {
    if (this.isInitialized) this.destroy();

    this.rootElem = rootElem;

    this.bindEvents();

    this.isInitialized = true;
  }

  bindEvents() {
    if (!this.rootElem) return;

    this.backBtn = this.rootElem.querySelector("#btn-back");

    this.backBtn?.addEventListener("click", this.onBackBtnClick);
  }

  destroy() {
    this.rootElem = null;

    this.isInitialized = false;
  }
}

export default ErrorController;
