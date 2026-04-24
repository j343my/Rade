import path from 'node:path';
import fsp from 'node:fs/promises';
import { RADE_ROOT } from '../index.js';
import { hasConfig, createConfig, writeConfig } from '../core/config.js';
import { backupDirectory } from '../core/backup.js';
import { generateAll } from '../core/generator.js';
import { exists, ensureDir, copyDir, writeText, readText } from '../utils/fs.js';
import * as log from '../utils/log.js';
import * as prompt from '../utils/prompt.js';

// Gitignore block managed by Rade
const GITIGNORE_BLOCK = `
# Rade generated
AGENTS.md
CLAUDE.md
.cursorrules
.cursor/rules/
.agents/rules/
.agents/imports/
.agents/skills/

# But keep .rade/
!.rade/

# Backups
.agents.backup.*.tar.gz
`;

const GITIGNORE_MARKER = '# Rade generated';

/**
 * Register the "attach" command.
 * @param {import('commander').Command} program
 */
export function registerAttach(program) {
  program
    .command('attach')
    .argument('[path]', 'target project path', '.')
    .description('Attach Rade to a project — generate agent configs')
    .action(async (targetArg) => {
      try {
        const targetPath = path.resolve(targetArg);
        await attachProject(targetPath);
      } catch (error) {
        log.err(error.message);
        process.exit(1);
      }
    });
}

/**
 * Full attach workflow.
 * @param {string} targetPath
 */
async function attachProject(targetPath) {
  // Verify target exists
  try {
    await fsp.access(targetPath);
  } catch {
    log.err(`Target directory does not exist: ${targetPath}`);
    process.exit(1);
  }

  log.blank();
  log.header('🤖 Rade Attach');
  log.info(`Source:  ${RADE_ROOT}`);
  log.info(`Target:  ${targetPath}`);
  log.blank();

  // Step 1: Check if .rade/ already exists
  if (await hasConfig(targetPath)) {
    const action = await prompt.select('This project already has Rade attached.', [
      { title: 'Re-attach (regenerate configs)', value: 're-attach' },
      { title: 'Update (sync rules then regenerate)', value: 'update' },
      { title: 'Cancel', value: 'cancel' },
    ]);

    if (action === 'cancel') {
      log.info('Cancelled.');
      return;
    }
    // For both re-attach and update, we continue below
  }

  // Step 2: Check if .agents/ already exists
  const agentsDir = path.join(targetPath, '.agents');
  if (await exists(agentsDir)) {
    const strategy = await prompt.select('Existing .agents/ directory found.', [
      { title: 'Keep existing (merge)', value: 'merge' },
      { title: 'Replace (backup first)', value: 'replace' },
      { title: 'Cancel', value: 'cancel' },
    ]);

    if (strategy === 'cancel') {
      log.info('Cancelled.');
      return;
    }

    if (strategy === 'replace') {
      await backupDirectory(agentsDir);
      await fsp.rm(agentsDir, { recursive: true, force: true });
    }
    // merge = proceed without removing
  }

  // Step 3: Create .rade/config.json
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const pkg = require('../../package.json');

  const config = createConfig({
    radeVersion: pkg.version,
    rulesVersion: 'local',
  });

  await writeConfig(targetPath, config);
  log.ok('Created .rade/config.json');

  // Step 4 & 5: Copy rules + skills to .agents/
  const rulesSource = path.join(RADE_ROOT, 'rules');
  const skillsSource = path.join(RADE_ROOT, 'skills');
  const importsSource = path.join(RADE_ROOT, 'imports');

  const agRules = path.join(agentsDir, 'rules');
  const agSkills = path.join(agentsDir, 'skills');
  const agImports = path.join(agentsDir, 'imports');

  await copyDir(rulesSource, agRules, { exclude: ['imported'] });
  log.ok('Copied rules → .agents/rules/');

  await copyDir(skillsSource, agSkills);
  log.ok('Copied skills → .agents/skills/');

  // Copy imports if they exist
  if (await exists(importsSource)) {
    await copyDir(importsSource, agImports);
    log.ok('Copied imports → .agents/imports/');
  } else {
    await ensureDir(agImports);
  }

  // Step 6: Generate multi-tool configs
  await generateAll({ radeRoot: RADE_ROOT, targetPath });

  // Step 7: Update .gitignore
  await updateGitignore(targetPath);

  // Step 8: Success message
  log.blank();
  log.ok('Done! Your project is now Rade-powered. 🚀');
  log.blank();
  log.info('Generated files:');
  log.info('  .rade/config.json      — Rade configuration');
  log.info('  .agents/rules/         — coding standards per tech');
  log.info('  .agents/skills/        — agent skill definitions');
  log.info('  .cursor/rules/*.mdc    — Cursor rules');
  log.info('  AGENTS.md              — bundled rules');
  log.info('  CLAUDE.md              — Claude Code config');
  log.info('  .cursorrules           — symlink to AGENTS.md');
  log.blank();
  log.info('Next steps:');
  log.info('  1. Edit .agents/rules/00-project-context.md.template');
  log.info('  2. Customize excluded rules in .rade/config.json');
  log.info('  3. Run "rade check" anytime to see pending updates');
  log.blank();
}

/**
 * Update the project's .gitignore with Rade-managed entries.
 */
async function updateGitignore(targetPath) {
  const gitignorePath = path.join(targetPath, '.gitignore');
  let content = '';

  try {
    content = await readText(gitignorePath);
  } catch {
    // No .gitignore yet
  }

  if (content.includes(GITIGNORE_MARKER)) {
    log.info('.gitignore already contains Rade entries — skipping');
    return;
  }

  const updated = content.trimEnd() + '\n' + GITIGNORE_BLOCK;
  await writeText(gitignorePath, updated);
  log.ok('Updated .gitignore with Rade entries');
}
