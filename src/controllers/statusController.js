import logger from "../utils/logger.js";
import * as statusModel from "../models/statusModel.js";

// Get all statuses
async function getAllStatuses(req, res) {
  try {
    const statuses = await statusModel.getAllStatuses();
    res.status(200).json({ data: statuses });
  } catch (error) {
    logger.error("StatusController.getAllStatuses: error retrieving statuses", {
      error,
    });
    res.status(500).json({ message: "Internal server error" });
  }
}

export { getAllStatuses };
