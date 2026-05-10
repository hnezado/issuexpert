import { logger } from "../scripts/core/logger.js";

// Validates username
// Between 3 and 30 characters
// Allowed: a-z, A-Z, 0-9, '.', '-', '_'
// Must start and end with alphanumeric characters
// Cannot contain two or more consecutive special characters ('.', '-', '_')
function isValidUsername(username) {
  if (!username) {
    logger.warn("UtilsUser.isValidUsername: no username");
    return false;
  }

  const regex = /^[a-zA-Z0-9]([a-zA-Z0-9]|[._-][a-zA-Z0-9]){2,29}$/;

  return regex.test(username);
}

// Validates email
// Starts with a letter or number
// Allows letters, numbers, and ._%+- in the local part
// Must have exactly one @ separator
// Domain allows letters, numbers, and hyphens
// Accepts optional subdomains
// Must end with a valid TLD (min 2 letters)
// Prevents invalid placements like starting/ending with special characters
function isValidEmail(email) {
  if (!email) {
    logger.warn("UtilsUser.isValidEmail: no email");
    return false;
  }

  const regex =
    /^[a-z0-9][a-z0-9._%+-]{0,62}[a-z0-9]@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;
  return regex.test(email);
}

// Validates password
// Length between 8 and 64 characters
// Only letters, numbers and allowed special characters (!@#$%&^*_-)
// Must contain at least one lowercase letter
// Must contain at least one uppercase letter
// Must contain at least one number
// Must contain at least one special character
function isValidPassword(password) {
  if (!password) {
    logger.warn("UtilsUser.isValidPassword: no password");
    return false;
  }

  const hasValidLength = /^.{8,64}$/.test(password);
  const hasAllowedChars = /^[a-zA-Z0-9!@#$%&^*_-]+$/.test(password);
  const hasSpecialChars = /[!@#$%&^*_-]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  return (
    hasValidLength &&
    hasAllowedChars &&
    hasSpecialChars &&
    hasLowercase &&
    hasUppercase &&
    hasNumber
  );
}

// Clean the username before registering or logging in
// Spaces " " become periods "."
function cleanUsername(username) {
  if (!username) {
    logger.warn("UtilsUser.cleanUsername: no username");
    return;
  }

  const cleanedUsername = username.trim().replace(/\s+/g, "."); // replace globally one or more spaces with dot
  return cleanedUsername;
}

// Generates avatar (username initials)
function getUserAvatar(username) {
  if (!username) return ":)";

  const parts = cleanUsername(username).split(".");

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export {
  isValidUsername,
  isValidEmail,
  isValidPassword,
  cleanUsername,
  getUserAvatar,
};
