import { fetchCurrentUser, clearCurrentUser } from "../auth/user.js";
import { API_BASE_URL, ROUTES } from "../config.js";
import { goTo } from "../core/router.js";

function initLogin() {
  // Handle login form submit
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    // Prevent page reloading
    e.preventDefault();

    const identifier = document.getElementById("identifier").value;
    const password = document.getElementById("password").value;

    try {
      // Login request to API
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login error");
        return;
      }

      // Save JWT token for future requests
      localStorage.setItem("auth_token", data.token);

      // 2. Clear previous session cache
      clearCurrentUser();

      // 3. Preload user in memory and sessionStorage
      await fetchCurrentUser();

      // Redirect
      goTo("dashboard");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  });
}

initLogin();
