import { fetchCurrentUser, clearCurrentUser } from "../auth/user.js";
import { API_BASE_URL } from "../config.js";
import { registerController } from "../core/controller-registry.js";
import { logger } from "../core/logger.js";
import { goTo } from "../core/router.js";

/**
 * Login controller (singleton)
 * Handles login form submission and authentication flow.
 */
class LoginController {
  static instance = null;

  // Singleton getter
  static getInstance() {
    if (!LoginController.instance) {
      LoginController.instance = new LoginController();
    }
    return LoginController.instance;
  }

  constructor() {
    // Root container element where this controller is mounted
    this.rootElem = null;

    this.onClickLogin = (e) => this.login(e);
    this.onEnter = (e) => {
      if (e.key === "Enter") {
        this.login(e);
      }
    };
  }

  init(rootElem) {
    this.rootElem = rootElem;

    this.gatherElements();
    this.bindEvents();
  }

  gatherElements() {
    if (!this.rootElem) {
      logger.error("ModalController: rootElem is missing");
      return;
    }

    this.loginViewContainer = this.rootElem.querySelector(
      "#login-view-container",
    );

    this.identifierInput = this.rootElem.querySelector(
      '[data-js="modal-login-identifier"]',
    );

    this.passwordInput = this.rootElem.querySelector(
      '[data-js="modal-login-password"]',
    );

    this.loginBtn = this.rootElem.querySelector('[data-js="modal-login-btn"]');

    if (
      !this.loginViewContainer ||
      !this.identifierInput ||
      !this.passwordInput ||
      !this.loginBtn
    ) {
      logger.warn("LoginController: missing elements", {
        rootContainer: this.loginViewContainer,
        identifier: this.identifierInput,
        password: this.passwordInput,
        button: this.loginBtn,
      });
      return;
    }
  }

  bindEvents() {
    // Click login
    this.loginBtn?.addEventListener("click", this.onClickLogin);

    // Enter key only in login view
    this.loginViewContainer?.addEventListener("keydown", this.onEnter);
  }

  async login(e) {
    if (e) e.preventDefault();

    const identifier = this.identifierInput.value;
    const password = this.passwordInput.value;

    if (!identifier || !password) {
      logger.warn("LoginController: missing credentials", {
        identifier,
        password,
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        logger.warn("LoginController: login error", { data: data.message });
        return;
      }

      localStorage.setItem("auth_token", data.token);

      clearCurrentUser();
      await fetchCurrentUser();

      goTo("dashboard");
    } catch (err) {
      logger.error("LoginController: login server error", { err });
    }
  }

  destroy() {
    this.loginBtn?.removeEventListener("click", this.onClickLogin);
    this.loginViewContainer?.removeEventListener("keydown", this.onEnter);

    this.rootElem = null;
    this.identifierInput = null;
    this.passwordInput = null;
    this.loginBtn = null;
    this.loginViewContainer = null;
  }
}

registerController("login", LoginController);

export default LoginController;
