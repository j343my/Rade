import chalk from 'chalk';

export function info(...args)   { console.log(chalk.cyan('ℹ'), ...args); }
export function ok(...args)     { console.log(chalk.green('✔'), ...args); }
export function warn(...args)   { console.log(chalk.yellow('⚠'), ...args); }
export function err(...args)    { console.error(chalk.red('✖'), ...args); }
export function blank()         { console.log(); }
export function header(text)    { console.log(chalk.bold(text)); }
export function dim(text)       { console.log(chalk.dim(text)); }
