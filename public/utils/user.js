const ROLES = {
  1: "admin",
  2: "technician",
  3: "user",
};

// Generates avatar (username initials)
function getUserAvatar(username) {
  if (!username) return ":)";

  const parts = username.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export { ROLES, getUserAvatar };
