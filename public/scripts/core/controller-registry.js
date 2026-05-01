import { logger } from "./logger.js";

const controllers = new Map();

const registerController = (name, controller) => {
  if (controllers.has(name)) {
    logger.warn("ControllerRegistry: Duplicate controller", {
      controllerName: name,
    });
    return;
  }

  controllers.set(name, controller);
};

const getController = (name) => {
  return controllers.get(name);
};

export { registerController, getController };
