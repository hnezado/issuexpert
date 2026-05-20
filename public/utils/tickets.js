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
  invalid: {
    label: "Invalid priority",
    icon: `
      <svg width="256px" height="256px" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <title>Priority invalid (__priority__)</title>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M9.11241 7.82201C9.44756 6.83666 10.5551 6 12 6C13.7865 6 15 7.24054 15 8.5C15 9.75946 13.7865 11 12 11C11.4477 11 11 11.4477 11 12L11 14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14L13 12.9082C15.203 12.5001 17 10.7706 17 8.5C17 5.89347 14.6319 4 12 4C9.82097 4 7.86728 5.27185 7.21894 7.17799C7.0411 7.70085 7.3208 8.26889 7.84366 8.44673C8.36653 8.62458 8.93457 8.34488 9.11241 7.82201ZM12 20C12.8285 20 13.5 19.3284 13.5 18.5C13.5 17.6716 12.8285 17 12 17C11.1716 17 10.5 17.6716 10.5 18.5C10.5 19.3284 11.1716 20 12 20Z"/>
      </svg>
    `,
  },
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
