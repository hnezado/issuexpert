import { registerController } from "../core/controller-registry.js";
import { goTo } from "../core/router.js";

/**
 *
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
    this.errorBtn = null;
    this.isInitialized = false;

    // Event listener handlers (used for removeEventListener in destroy)
    this.onErrorBtnClick = () => goTo("error");
  }

  async init(rootElem) {
    if (this.isInitialized) this.destroy();

    this.rootElem = rootElem;

    this.bindEvents();

    this.isInitialized = true;
  }

  bindEvents() {
    if (!this.rootElem) return;
    this.errorBtn = this.rootElem.querySelector("#btn-force-error");

    this.errorBtn?.addEventListener("click", this.onErrorBtnClick);
  }

  destroy() {
    this.errorBtn?.removeEventListener("click", this.onErrorBtnClick);

    this.rootElem = null;

    this.isInitialized = false;
  }
}

registerController("dashboard", DashboardController);

export default DashboardController;
