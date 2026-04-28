import DashboardController from "../controllers/dashboard.controller.js";
import LoginController from "../controllers/login.controller.js";

const controllersMap = {
  login: LoginController,
  dashboard: DashboardController,
};

/**
 * Renders views and initializes their controllers
 */
async function render(viewKeys) {
  if (!viewKeys) return;

  const app = document.getElementById("app");

  let html = "";

  // Fetch all views
  for (const viewKey of viewKeys) {
    try {
      const res = await fetch(`/views/${viewKey}.view.html`);
      html += await res.text();
    } catch (err) {
      console.error("Error loading view: ", viewKey, err);
    }
  }

  // Mount full view
  app.innerHTML = html;

  // Load CSS
  for (const viewKey of viewKeys) {
    // Avoid duplicates (unique id)
    const cssId = `view-css-${viewKey}`;

    if (document.getElementById(cssId)) continue;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `/css/${viewKey}.css`;
    link.id = cssId;

    document.head.appendChild(link);
  }

  // Initialize controllers
  for (const viewKey of viewKeys) {
    const Controller = controllersMap[viewKey];
    if (!Controller) continue;

    const controllerInstance = Controller.getInstance();

    try {
      await controllerInstance.init(app);
    } catch (err) {
      console.error("Error initializing controllers: ", err);
    }
  }
}

export { render };
