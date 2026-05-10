import app from "./app.js";
import dotenv from "dotenv";
import logger from "./utils/logger.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
