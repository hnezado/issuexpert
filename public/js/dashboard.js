import { loadCurrentUser } from "./auth/user.js";

let currentUser = null;
let userAvatarContent = null;

async function init() {
  currentUser = await loadCurrentUser();
  userAvatarContent = getUserAvatarContent();

  document.getElementById("user-avatar-content").textContent =
    userAvatarContent;
  document.getElementById("userName").textContent = currentUser.username
    .split(" ")
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  document.getElementById("userEmail").textContent = currentUser.email;
  document.getElementById("userRole").textContent =
    currentUser.role[0].toUpperCase() + currentUser.role.slice(1).toLowerCase();
}

function getUserAvatarContent() {
  try {
    const username = currentUser.username;
    return Array.from(username.split(" ").map((w) => w[0].toUpperCase())).join(
      "",
    );
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
//         username: "hernandita gurgundánfila",
//         password: "hernanditapw",
//         email: "hernandita.gurgundanfila@issuexpert.com",
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
