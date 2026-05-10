const roles = {
  admin: 1,
  technician: 2,
  user: 3,
};

function getRoleId(role) {
  return roles[role] ?? null;
}

export { getRoleId };
