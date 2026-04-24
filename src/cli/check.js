import { computeDiff, displayDiff } from '../core/syncer.js';
import * as log from '../utils/log.js';

/**
 * Register the "check" command.
 * @param {import('commander').Command} program
 */
export function registerCheck(program) {
  program
    .command('check')
    .description('Show what has changed without modifying anything')
    .action(async () => {
      try {
        const targetPath = process.cwd();
        await checkProject(targetPath);
      } catch (error) {
        log.err(error.message);
        process.exit(1);
      }
    });
}

/**
 * Check workflow (read-only).
 */
async function checkProject(targetPath) {
  log.blank();
  log.header('🔍 Rade Check');
  log.blank();

  const diff = await computeDiff(targetPath);
  displayDiff(diff);

  const hasChanges = diff.newRules.length > 0 ||
                     diff.modifiedRules.length > 0 ||
                     diff.deletedRules.length > 0;

  if (hasChanges) {
    log.blank();
    log.info('Run "rade sync" or "rade update" to apply changes.');
  }
}
