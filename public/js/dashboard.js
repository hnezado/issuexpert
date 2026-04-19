const username = "Ataulfo Gerfídelo";
// const username = "Hector Martinez";

const userAvatarContent = Array.from(
  username.split(" ").map((w) => w[0].toUpperCase()),
).join("");

document.getElementById("user-avatar-content").textContent = userAvatarContent;
