import { ENV } from "../config.js";

/**
 * Simple environment-based logger utility.
 * Logs info, warnings, and errors with optional context.
 * Info and warn only run in development mode.
 */
const logger = {
  info: (message, context = {}) => {
    if (ENV === "dev") console.info(`[INFO] ${message}`, context);
  },
  warn: (message, context = {}) => {
    if (ENV === "dev") console.warn(`[WARN] ${message}`, context);
  },
  error: (message, context = {}) => {
    console.error(`[ERROR] ${message}`, context);
  },
};

export { logger };
