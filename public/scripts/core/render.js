import { getController } from "./controller-registry.js";
import { logger } from "./logger.js";

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
      logger.error("Render: error loading view: ", viewKey, err);
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

  // Register controllers
  for (const viewKey of viewKeys) {
    try {
      await import(`/scripts/controllers/${viewKey}.controller.js`);
    } catch (err) {
      logger.warn("Render: no controller for view.", { viewKey, err });
    }
  }

  // Initialize controllers
  for (const viewKey of viewKeys) {
    const Controller = getController(viewKey);
    let controllerInstance;

    if (Controller) {
      controllerInstance = Controller.getInstance();
    } else {
      logger.warn("Render: missing controller", {
        viewKey,
      });
      continue;
    }

    try {
      await controllerInstance.init(app);
    } catch (err) {
      logger.error("Render: error initializing controllers.", { viewKey, err });
    }
  }
}

export { render };
