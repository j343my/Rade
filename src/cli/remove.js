import path from 'node:path';
import { hasConfig, readConfig, writeConfig } from '../core/config.js';
import { exists, remove, listFiles } from '../utils/fs.js';
import { USER_IMPORTS_DIR } from '../utils/paths.js';
import * as log from '../utils/log.js';
import * as prompt from '../utils/prompt.js';

export function registerRemove(program) {
  program
    .command('remove')
    .argument('<rule>', 'rule filename (e.g. go.md)')
    .option('--global', 'remove from global store (~/.rade/imports/)')
    .description('Remove or exclude a rule')
    .action(async (rule, opts) => {
      try {
        await removeAction(rule, opts);
      } catch (error) {
        log.err(error.message);
        process.exit(1);
      }
    });
}

async function removeAction(ruleName, opts) {
  log.blank();

  // Normalize: ensure .md extension
  const name = ruleName.endsWith('.md') || ruleName.endsWith('.mdc')
    ? ruleName
    : `${ruleName}.md`;

  if (opts.global) {
    await removeGlobal(name);
    return;
  }

  const cwd = process.cwd();
  if (!(await hasConfig(cwd))) {
    log.err('Not in a Rade project. Use --global to remove from ~/.rade/imports/.');
    process.exit(1);
  }

  // Check if it's a project import (can delete) or a built-in (can only exclude)
  const projectImport = path.join(cwd, '.agents', 'imports', name);
  if (await exists(projectImport)) {
    const confirmed = await prompt.confirm(`Delete ${name} from .agents/imports/?`);
    if (!confirmed) { log.info('Cancelled.'); return; }
    await remove(projectImport);
    log.ok(`Deleted .agents/imports/${name}`);
  } else {
    // Built-in or global rule — add to excluded_rules
    const config = await readConfig(cwd);
    const excluded = new Set(config.excluded_rules || []);
    if (excluded.has(name)) {
      log.info(`${name} is already excluded in this project.`);
      return;
    }
    excluded.add(name);
    await writeConfig(cwd, { ...config, excluded_rules: [...excluded] });
    log.ok(`Excluded ${name} from this project (added to .rade/config.json).`);
    log.dim('Run "rade-cli update" to regenerate configs without this rule.');
  }

  log.blank();
}

async function removeGlobal(name) {
  const filePath = path.join(USER_IMPORTS_DIR, name);
  if (!(await exists(filePath))) {
    // Try to find it (maybe no extension was provided)
    const files = await listFiles(USER_IMPORTS_DIR, { extensions: ['.md', '.mdc'] });
    const match = files.find(f => path.basename(f, path.extname(f)) === path.basename(name, path.extname(name)));
    if (!match) {
      log.err(`Rule not found in ~/.rade/imports/: ${name}`);
      process.exit(1);
    }
    const confirmed = await prompt.confirm(`Delete ${path.basename(match)} from ~/.rade/imports/?`);
    if (!confirmed) { log.info('Cancelled.'); return; }
    await remove(match);
    log.ok(`Deleted ${path.basename(match)} from global store.`);
    log.blank();
    return;
  }

  const confirmed = await prompt.confirm(`Delete ${name} from ~/.rade/imports/?`);
  if (!confirmed) { log.info('Cancelled.'); return; }
  await remove(filePath);
  log.ok(`Deleted ${name} from global store.`);
  log.blank();
}
