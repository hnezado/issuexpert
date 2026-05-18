import { logger } from "../scripts/core/logger.js";

const PRIORITIES = {
  low: {
    label: "Low",
    icon: `
      <svg width="256px" height="256px" viewBox="0 0 24 24"  fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <title>Priority low (__priority__)</title>
        <path d="M7 13L12 18L17 13M7 6L12 11L17 6"/>
      </svg>`,
  },
  medium: {
    label: "Medium",
    icon: `
      <svg width="256px" height="256px" viewBox="0 0 24 24"  fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <title>Priority medium (__priority__)</title>
        <path d="M6 9L12 15L18 9"/>
      </svg>`,
  },
  high: {
    label: "High",
    icon: `
      <svg width="256px" height="256px" viewBox="0 0 24 24"  fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <title>Priority high (__priority__)</title>
        <path d="M6 15L12 9L18 15"/>
      </svg>`,
  },
  critical: {
    label: "Critical",
    icon: `
      <svg width="256px" height="256px" viewBox="0 0 24 24"  fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <title>Priority critical (__priority__)</title>
        <path d="M17 18L12 13L7 18M17 11L12 6L7 11"/>
      </svg>`,
  },
  invalid: { label: "Invalid priority" },
};

const STATUSES = {
  open: "open",
  in_progress: "in_progress",
  resolved: "resolved",
  closed: "closed",
};

// Returns corresponding priority label
function getPriorityKey(priority = 5) {
  if (typeof priority !== "number" || priority < 1 || priority > 9) {
    return null;
  }

  if (priority <= 2) return "low";
  if (priority <= 5) return "medium";
  if (priority <= 7) return "high";
  return "critical";
}

// Links corresponding priority label to its data
function getPriorityStr(priority = 5) {
  const key = getPriorityKey(priority);

  if (!key) {
    // logger.warn("invalid priority", { priority });
    return "invalid";
  }

  return key;
}

// Formats priority
function formatPriority(priority = 5, showIcon = false, labelFirst = true) {
  const priorityKey = getPriorityStr(priority);

  const priorityData = PRIORITIES[priorityKey];

  if (!priorityData) {
    logger.warn("UtilsTickets.formatPriority: no priority data", {
      priorityKey,
    });
    return "";
  }

  let { label, icon } = priorityData;

  if (icon) {
    icon = icon.replace("__priority__", priority);
  }

  const priorityStr = labelFirst
    ? `${label} (${priority})`
    : `${priority} (${label.toLowerCase()})`;

  return showIcon ? `${icon}` : `${priorityStr}`;
}

// Formats status
function formatStatus(status) {
  if (!status) {
    logger.warn("UtilsTickets.formatStatus: no status");
    return;
  }

  let formattedStatus = status.trim().replaceAll("_", " ");
  formattedStatus = `${formattedStatus[0]?.toUpperCase()}${formattedStatus.slice(1)}`;

  return formattedStatus;
}

// Formats tickets list name
function formatTicketListName(name) {
  if (!name) return "";

  const parts = name.trim().split("-").filter(Boolean);

  if (parts.length === 0) return "";

  const [first, ...rest] = parts;

  return (
    first.charAt(0).toUpperCase() +
    first.slice(1) +
    (rest.length ? " " + rest.join(" ") : "")
  );
}

export {
  PRIORITIES,
  STATUSES,
  getPriorityKey,
  getPriorityStr,
  formatPriority,
  formatStatus,
  formatTicketListName,
};
