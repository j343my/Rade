import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { registerAttach } from './cli/attach.js';
import { registerSync } from './cli/sync.js';
import { registerCheck } from './cli/check.js';
import { registerUpdate } from './cli/update.js';
import { registerImport } from './cli/import.js';
import { registerDetach } from './cli/detach.js';
import { registerList } from './cli/list.js';
import { registerRemove } from './cli/remove.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const RADE_ROOT = path.resolve(__dirname, '..');

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));

export function run(argv) {
  const program = new Command();

  program
    .name('rade-cli')
    .description('Infrastructure for AI agents. Attach Rade to any project.')
    .version(pkg.version);

  registerAttach(program);
  registerSync(program);
  registerCheck(program);
  registerUpdate(program);
  registerImport(program);
  registerDetach(program);
  registerList(program);
  registerRemove(program);

  program.parse(argv);
}
