import chalk from "chalk";

const logger = {
  info: (msg, context = {}) =>
    console.log(chalk.green(`[INFO] ${msg}\n`), context ?? ""),
  warn: (msg, context = {}) =>
    console.log(chalk.yellow(`[WARN] ${msg}\n`), context ?? ""),
  error: (msg, context = {}) =>
    console.log(chalk.red(`[ERROR] ${msg}\n`), context.error ?? ""),
};

export default logger;
