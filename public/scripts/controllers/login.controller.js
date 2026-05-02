import { fetchCurrentUser, clearCurrentUser } from "../auth/user.js";
import { API_BASE_URL } from "../config.js";
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
    this.form = null;
    this.onSubmit = (event) => this.handleSubmit(event);
  }

  init(rootElem) {
    this.rootElem = rootElem;

    this.bindEvents();
  }

  bindEvents() {
    this.form = this.rootElem.querySelector("#loginForm");
    this.form?.addEventListener("submit", this.onSubmit);
  }

  async handleSubmit(e) {
    e.preventDefault();

    const identifier = this.rootElem.querySelector("#identifier").value;
    const password = this.rootElem.querySelector("#password").value;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login error");
        return;
      }

      localStorage.setItem("auth_token", data.token);

      clearCurrentUser();
      await fetchCurrentUser();

      goTo("dashboard");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  }

  destroy() {
    this.form?.removeEventListener("submit", this.onSubmit);
    this.form = null;
    this.rootElem = null;
  }
}

export default LoginController;
