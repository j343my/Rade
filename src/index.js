import { Command } from 'commander';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { registerAttach } from './cli/attach.js';
import { registerSync } from './cli/sync.js';
import { registerCheck } from './cli/check.js';
import { registerUpdate } from './cli/update.js';
import { registerImport } from './cli/import.js';
import { registerDetach } from './cli/detach.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the Rade source root (one level up from src/)
export const RADE_ROOT = path.resolve(__dirname, '..');

// Read version from package.json
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

/**
 * Build and run the CLI program.
 * @param {string[]} argv - process.argv
 */
export function run(argv) {
  const program = new Command();

  program
    .name('rade')
    .description('Infrastructure for AI agents. Attach Rade to any project.')
    .version(pkg.version);

  registerAttach(program);
  registerSync(program);
  registerCheck(program);
  registerUpdate(program);
  registerImport(program);
  registerDetach(program);

  program.parse(argv);
}
