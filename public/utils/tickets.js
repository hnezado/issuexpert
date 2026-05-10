import { logger } from "../scripts/core/logger.js";

const PRIORITIES = {
  low: { label: "Low", icon: "🟢" },
  medium: { label: "Medium", icon: "🔵" },
  high: { label: "High", icon: "🟡" },
  critical: { label: "Critical", icon: "🔴" },
  invalid: { label: "Invalid priority" },
};

// Returns corresponding priority label
function getPriorityStr(priority = 5) {
  if (typeof priority !== "number" || priority < 1 || priority > 9) {
    logger.warn("UtilsTickets.getPriorityStr: invalid priority.", { priority });
    return "invalid";
  }

  let key;
  if (priority <= 2) key = "low";
  else if (priority <= 5) key = "medium";
  else if (priority <= 7) key = "high";
  else key = "critical";

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

export { getPriorityStr, formatPriority };
