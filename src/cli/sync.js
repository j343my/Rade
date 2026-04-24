import path from 'node:path';
import { computeDiff, displayDiff } from '../core/syncer.js';
import { writeConfig } from '../core/config.js';
import { generateAll, parseTools } from '../core/generator.js';
import { RADE_ROOT } from '../index.js';
import { copyDir } from '../utils/fs.js';
import * as log from '../utils/log.js';
import * as prompt from '../utils/prompt.js';

/**
 * Register the "sync" command.
 * @param {import('commander').Command} program
 */
export function registerSync(program) {
  program
    .command('sync')
    .description('Check for rule updates and apply them')
    .action(async () => {
      try {
        const targetPath = process.cwd();
        await syncProject(targetPath);
      } catch (error) {
        log.err(error.message);
        process.exit(1);
      }
    });
}

/**
 * Sync workflow.
 */
async function syncProject(targetPath) {
  log.blank();
  log.header('🔄 Rade Sync');
  log.blank();

  const diff = await computeDiff(targetPath);
  displayDiff(diff);

  const hasChanges = diff.newRules.length > 0 ||
                     diff.modifiedRules.length > 0 ||
                     diff.deletedRules.length > 0;

  if (!hasChanges) {
    return;
  }

  log.blank();
  const proceed = await prompt.confirm('Apply these changes?');
  if (!proceed) {
    log.info('Sync cancelled.');
    return;
  }

  // Re-copy rules from source
  const rulesSource = path.join(RADE_ROOT, 'rules');
  const agRules = path.join(targetPath, '.agents', 'rules');
  await copyDir(rulesSource, agRules, { exclude: ['imported'] });

  // Regenerate configs using the tools saved in config
  const tools = parseTools(diff.config.tools);
  await generateAll({ radeRoot: RADE_ROOT, targetPath, tools });

  // Update config
  const config = diff.config;
  config.last_synced = new Date().toISOString();
  config.rules_version = 'local';
  await writeConfig(targetPath, config);

  log.blank();
  log.ok('Sync complete. All configs regenerated. 🚀');
}
