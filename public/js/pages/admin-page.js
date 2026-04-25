import { API_BASE_URL, ROLES, ROUTES } from "../config.js";
import { goTo } from "../core/router.js";

let users = null;

async function init() {
  document
    .querySelector("#btn-back-to-dashboard")
    .addEventListener("click", () => goTo("dashboard"));

  users = await fetchUsers();
  console.log("users: ", users);
  renderUsers();
}

async function fetchUsers() {
  const token = localStorage.getItem("auth_token");
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching users");
    }

    const users = await response.json();
    return users;
  } catch (error) {
    console.error(error);
    return [];
  }
}

function renderUsers() {
  const tbody = document.getElementById("users-tbody");
  tbody.innerHTML = "";

  users.forEach((user) => {
    const tr = document.createElement("tr");

    if (!user.active) {
      tr.classList.add("user-inactive");
    }

    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>${ROLES[user.role_id]}</td>
      <td>${user.active ? "Yes" : "No"}</td>
      <td class="actions">
        <button class="btn btn-secondary btn-edit" data-id="${user.id}">Edit</button>
        <button class="btn btn-danger btn-toggle" data-id="${user.id}">
          ${user.active ? "Deactivate" : "Activate"}
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

init();
