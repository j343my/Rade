import path from 'node:path';
import { importRule } from '../core/importer.js';
import { hasConfig } from '../core/config.js';
import { USER_IMPORTS_DIR } from '../utils/paths.js';
import * as log from '../utils/log.js';

export function registerImport(program) {
  program
    .command('import')
    .argument('<source>', 'GitHub repo URL, raw URL, or local file path')
    .option('--output <name>', 'custom output filename (without extension)')
    .option('--global', 'import into ~/.rade/imports/ instead of the current project')
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

async function importAction(source, opts) {
  log.blank();
  log.header('📥 Rade Import');
  log.blank();

  const cwd = process.cwd();
  let targetDir;

  if (opts.global || !(await hasConfig(cwd))) {
    targetDir = USER_IMPORTS_DIR;
    log.info(`Importing into global store: ${USER_IMPORTS_DIR}`);
  } else {
    targetDir = path.join(cwd, '.agents', 'imports');
    log.info('Importing into project .agents/imports/');
  }

  await importRule(source, { output: opts.output, targetDir });

  log.blank();
  if (opts.global || !(await hasConfig(cwd))) {
    log.ok('Import complete. New projects will include this rule automatically.');
  } else {
    log.ok('Import complete. Run "rade-cli update" to regenerate configs.');
  }
}
