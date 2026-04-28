import DashboardController from "../controllers/dashboard.controller.js";
import ErrorController from "../controllers/error.controller.js";
import LoginController from "../controllers/login.controller.js";

const controllersMap = {
  login: LoginController,
  dashboard: DashboardController,
  error: ErrorController,
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
  console.log("renderizando html");
  app.innerHTML = html;

  // Load CSS
  console.log("initializing css");
  for (const viewKey of viewKeys) {
    // Avoid duplicates (unique id)
    const cssId = `view-css-${viewKey}`;

    if (document.getElementById(cssId)) continue;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `/css/${viewKey}.css`;
    link.id = cssId;

    console.log("link: ", link);

    document.head.appendChild(link);
  }

  // Initialize controllers
  console.log("inizializando controladores");
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
