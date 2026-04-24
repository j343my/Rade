import path from 'node:path';
import { RADE_ROOT } from '../index.js';
import { hasConfig, readConfig } from '../core/config.js';
import { listFiles, exists } from '../utils/fs.js';
import { USER_IMPORTS_DIR } from '../utils/paths.js';
import * as log from '../utils/log.js';

export function registerList(program) {
  program
    .command('list')
    .option('--global', 'show only global rules (~/.rade/imports/)')
    .description('List all active rules (built-in, global, project)')
    .action(async (opts) => {
      try {
        await listAction(opts);
      } catch (error) {
        log.err(error.message);
        process.exit(1);
      }
    });
}

async function listAction(opts) {
  log.blank();
  log.header('📋 Rade Rules');
  log.blank();

  if (opts.global) {
    await printLayer('Global (~/.rade/imports/)', USER_IMPORTS_DIR, []);
    log.blank();
    return;
  }

  const cwd = process.cwd();
  const excluded = await getExcluded(cwd);

  await printLayer('Built-in (rade-cli package)', path.join(RADE_ROOT, 'rules'), excluded);
  log.blank();
  await printLayer('Global (~/.rade/imports/)', USER_IMPORTS_DIR, excluded);
  log.blank();

  if (await hasConfig(cwd)) {
    await printLayer('Project (.agents/imports/)', path.join(cwd, '.agents', 'imports'), excluded);
    log.blank();

    if (excluded.length > 0) {
      log.warn(`Excluded in this project: ${excluded.join(', ')}`);
      log.blank();
    }
  } else {
    log.dim('Not in a Rade project — run "rade-cli attach ." to attach.');
    log.blank();
  }
}

async function printLayer(label, dir, excluded) {
  log.info(label);

  if (!(await exists(dir))) {
    log.dim('  (empty)');
    return;
  }

  const files = await listFiles(dir, { extensions: ['.md', '.mdc'], recursive: true });
  const rules = files
    .map(f => path.basename(f))
    .filter(n => !n.endsWith('.template'));

  if (rules.length === 0) {
    log.dim('  (empty)');
    return;
  }

  for (const name of rules) {
    const isExcluded = excluded.includes(name);
    if (isExcluded) {
      log.dim(`  - ${name} (excluded)`);
    } else {
      console.log(`  + ${name}`);
    }
  }
}

async function getExcluded(cwd) {
  if (!(await hasConfig(cwd))) return [];
  try {
    const config = await readConfig(cwd);
    return config.excluded_rules || [];
  } catch {
    return [];
  }
}
