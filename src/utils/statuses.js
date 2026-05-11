const statuses = {
  open: 1,
  in_progress: 2,
  resolved: 3,
  closed: 4,
};

function getStatusId(status) {
  return statuses[status] ?? null;
}

export { getStatusId };
