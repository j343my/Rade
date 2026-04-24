import path from 'node:path';
import { importRule } from '../core/importer.js';
import { hasConfig } from '../core/config.js';
import { RADE_ROOT } from '../index.js';
import * as log from '../utils/log.js';

/**
 * Register the "import" command.
 * @param {import('commander').Command} program
 */
export function registerImport(program) {
  program
    .command('import')
    .argument('<source>', 'GitHub repo URL, raw URL, or local file path')
    .option('--output <name>', 'custom output filename (without extension)')
    .description('Import an external rule into Rade')
    .action(async (source, opts) => {
      try {
        await importAction(source, opts);
      } catch (error) {
        log.err(error.message);
        process.exit(1);
      }
    });
}

/**
 * Import workflow.
 */
async function importAction(source, opts) {
  log.blank();
  log.header('📥 Rade Import');
  log.blank();

  const cwd = process.cwd();

  // Determine target directory:
  // - If in a project with .rade/ → import to .agents/imports/
  // - Otherwise → import to Rade's own imports/ directory
  let targetDir;

  if (await hasConfig(cwd)) {
    targetDir = path.join(cwd, '.agents', 'imports');
    log.info('Importing into project .agents/imports/');
  } else {
    targetDir = path.join(RADE_ROOT, 'imports');
    log.info('Importing into Rade central imports/');
  }

  await importRule(source, {
    output: opts.output,
    targetDir,
  });

  log.blank();
  log.ok('Import complete. Run "rade update" to regenerate configs.');
}
