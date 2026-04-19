import { loadCurrentUser } from "./auth/user.js";

let currentUser = null;
let userAvatarContent = null;

async function init() {
  currentUser = await loadCurrentUser();
  userAvatarContent = getUserAvatarContent();

  document.getElementById("user-avatar-content").textContent =
    userAvatarContent;
  document.getElementById("userName").textContent =
    currentUser.username.toUpperCase()[0] + currentUser.username.slice(1);
  document.getElementById("userRole").textContent = currentUser.role;
}

function getUserAvatarContent() {
  try {
    const username = currentUser.username;
    // const username = "Ataulfo Gerfídelo";
    // const username = "Hector Martinez";
    return Array.from(username.split(" ").map((w) => w[0].toUpperCase())).join(
      "",
    );
  } catch (err) {
    console.error(err);
  }
}

init();
