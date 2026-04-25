import { goTo } from "../core/router.js";

const goHome = {
  label: "Go Home",
  type: "primary",
  action: () => goTo("index"),
};

const ERROR_CONTENT = {
  NOT_FOUND: {
    title: "404 - Not Found",
    description: "The specified route was not found",
    icon: "🚫",
  },
  NOT_AUTHENTICATED: {
    title: "Authentication Required",
    description: "You need to be logged in to access this page",
    icon: "🔒",
  },
  NO_PERMISSIONS: {
    title: "Access Denied",
    description: "You don't have permission to access this page",
    icon: "⛔",
  },
};

const ERROR_ACTIONS = {
  NOT_FOUND: [
    goHome,
    {
      label: "Go Back",
      type: "secondary",
      action: () => window.history.back(),
    },
  ],

  NOT_AUTHENTICATED: [
    {
      label: "Login",
      type: "primary",
      action: () => (window.location.href = "/login.html"),
    },
  ],

  NO_PERMISSIONS: [
    goHome,
    {
      label: "Contact Admin",
      type: "secondary",
      action: () => alert("Contact support"),
    },
  ],
};

function init() {
  const params = new URLSearchParams(window.location.search);
  const errorCode = params.get("type");

  const titleElement = document.querySelector("#error-title");
  const descriptionElement = document.querySelector("#error-description");
  const iconElement = document.querySelector("#error-icon");
  const actionsContainer = document.querySelector("#error-actions");

  if (
    !titleElement ||
    !descriptionElement ||
    !iconElement ||
    !actionsContainer
  ) {
    return;
  }

  const content = ERROR_CONTENT[errorCode] || {
    title: "Something went wrong",
    description: "An unexpected error occurred",
    icon: "⚠️",
  };

  titleElement.textContent = content.title;
  descriptionElement.textContent = content.description;
  iconElement.textContent = content.icon;

  const actions = ERROR_ACTIONS[errorCode] || [goHome];

  actionsContainer.innerHTML = "";

  actions.forEach((btn) => {
    const button = document.createElement("button");

    button.textContent = btn.label;
    button.classList.add("error-container__button");
    button.classList.add(`error-container__button--${btn.type}`);

    button.addEventListener("click", btn.action);

    actionsContainer.appendChild(button);
  });
}

init();
