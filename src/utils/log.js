import chalk from 'chalk';

/**
 * Log an informational message (cyan ℹ).
 * @param {...any} args
 */
export function info(...args) {
  console.log(chalk.cyan('ℹ'), ...args);
}

/**
 * Log a success message (green ✔).
 * @param {...any} args
 */
export function ok(...args) {
  console.log(chalk.green('✔'), ...args);
}

/**
 * Log a warning message (yellow ⚠).
 * @param {...any} args
 */
export function warn(...args) {
  console.log(chalk.yellow('⚠'), ...args);
}

/**
 * Log an error message (red ✖) to stderr.
 * @param {...any} args
 */
export function err(...args) {
  console.error(chalk.red('✖'), ...args);
}

/**
 * Print a blank line.
 */
export function blank() {
  console.log();
}

/**
 * Print a bold header.
 * @param {string} text
 */
export function header(text) {
  console.log(chalk.bold(text));
}

/**
 * Print a dim secondary text.
 * @param {string} text
 */
export function dim(text) {
  console.log(chalk.dim(text));
}
