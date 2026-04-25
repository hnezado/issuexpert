import { API_BASE_URL, ROLES, ROUTES } from "../config.js";
import { goTo } from "../core/router.js";
import { fetchCurrentUser } from "../auth/user.js";
import { logout } from "../auth/logout.js";

let currentUser = null;
let userAvatarContent = null;

async function init() {
  try {
    document
      .querySelector("#btn-admin-page")
      .addEventListener("click", () => goTo("adminPage"));

    document
      .querySelector("#btn-logout")
      .addEventListener("click", () => logout());

    // USER INFO
    currentUser = await fetchCurrentUser();

    userAvatarContent = fetchUserAvatarContent(currentUser);

    document.getElementById("user-avatar-content").textContent =
      userAvatarContent;

    document.getElementById("userName").textContent = currentUser.username
      .split(" ")
      .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

    document.getElementById("userEmail").textContent = currentUser.email;

    const role = currentUser.role ?? "";
    document.getElementById("userRole").textContent =
      role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  } catch (err) {
    console.error(err);
  }
}

function fetchUserAvatarContent(user) {
  if (!user) return;
  try {
    const username = user.username;
    return username
      .split(" ")
      .map((w) => w[0].toUpperCase())
      .join("");
  } catch (err) {
    console.error(err);
  }
}

init();

// async function addUser() {
//   try {
//     // Login request to API
//     const res = await fetch(`${API_BASE_URL}/users/new`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         username: "",
//         password: "",
//         email: "@issuexpert.com",
//         role_id: 3,
//       }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       alert(data.message || "Error creating user");
//       return;
//     }
//   } catch (err) {
//     console.error(err);
//     alert("Server error");
//   }
// }
