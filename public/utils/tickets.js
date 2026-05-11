import { logger } from "../scripts/core/logger.js";

const PRIORITIES = {
  low: { label: "Low", icon: "🟢" },
  medium: { label: "Medium", icon: "🔵" },
  high: { label: "High", icon: "🟡" },
  critical: { label: "Critical", icon: "🔴" },
  invalid: { label: "Invalid priority" },
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
function formatPriority(priority = 5, showIcon = false) {
  const priorityKey = getPriorityStr(priority);

  const priorityData = PRIORITIES[priorityKey];

  if (!priorityData) {
    logger.warn("UtilsTickets.formatPriority: no priority data", {
      priorityKey,
    });
    return "";
  }

  const { label, icon } = priorityData;

  return showIcon && icon
    ? `${icon} ${label} (${priority})`
    : `${label} (${priority})`;
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

export { getPriorityStr, formatPriority, formatStatus };
