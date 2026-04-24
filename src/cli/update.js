import path from 'node:path';
import { readConfig, writeConfig } from '../core/config.js';
import { generateAll } from '../core/generator.js';
import { RADE_ROOT } from '../index.js';
import { copyDir } from '../utils/fs.js';
import * as log from '../utils/log.js';

/**
 * Register the "update" command.
 * @param {import('commander').Command} program
 */
export function registerUpdate(program) {
  program
    .command('update')
    .description('Pull latest rules and regenerate all configs')
    .action(async () => {
      try {
        const targetPath = process.cwd();
        await updateProject(targetPath);
      } catch (error) {
        log.err(error.message);
        process.exit(1);
      }
    });
}

/**
 * Update workflow: re-copies rules from source, regenerates configs.
 */
async function updateProject(targetPath) {
  log.blank();
  log.header('⬆️  Rade Update');
  log.blank();

  // Re-copy rules from source
  const rulesSource = path.join(RADE_ROOT, 'rules');
  const skillsSource = path.join(RADE_ROOT, 'skills');
  const agRules = path.join(targetPath, '.agents', 'rules');
  const agSkills = path.join(targetPath, '.agents', 'skills');

  await copyDir(rulesSource, agRules, { exclude: ['imported'] });
  log.ok('Updated rules from Rade source');

  await copyDir(skillsSource, agSkills);
  log.ok('Updated skills from Rade source');

  // Regenerate configs
  await generateAll({ radeRoot: RADE_ROOT, targetPath });

  // Update config
  const config = await readConfig(targetPath);
  config.last_synced = new Date().toISOString();
  config.rules_version = 'local';
  await writeConfig(targetPath, config);

  log.blank();
  log.ok('Update complete. All configs regenerated. 🚀');
}
