import path from 'node:path';
import fsp from 'node:fs/promises';
import { hasConfig } from '../core/config.js';
import { exists, remove, readText, writeText } from '../utils/fs.js';
import * as log from '../utils/log.js';
import * as prompt from '../utils/prompt.js';

/**
 * Register the "detach" command.
 * @param {import('commander').Command} program
 */
export function registerDetach(program) {
  program
    .command('detach')
    .description('Remove Rade from the current project')
    .action(async () => {
      try {
        const targetPath = process.cwd();
        await detachProject(targetPath);
      } catch (error) {
        log.err(error.message);
        process.exit(1);
      }
    });
}

/**
 * Detach workflow.
 */
async function detachProject(targetPath) {
  log.blank();
  log.header('🔌 Rade Detach');
  log.blank();

  if (!(await hasConfig(targetPath))) {
    log.err('This project does not have Rade attached.');
    process.exit(1);
  }

  const confirmed = await prompt.confirm(
    'This will remove .rade/ and all generated configs. Continue?',
    false
  );

  if (!confirmed) {
    log.info('Cancelled.');
    return;
  }

  // Remove generated files
  const toRemove = [
    path.join(targetPath, '.rade'),
    path.join(targetPath, '.agents'),
    path.join(targetPath, '.cursor', 'rules'),
    path.join(targetPath, 'AGENTS.md'),
    path.join(targetPath, 'CLAUDE.md'),
    path.join(targetPath, '.cursorrules'),
  ];

  for (const item of toRemove) {
    if (await exists(item)) {
      await remove(item);
      log.ok(`Removed ${path.relative(targetPath, item)}`);
    }
  }

  // Clean .cursor/ if empty
  const cursorDir = path.join(targetPath, '.cursor');
  if (await exists(cursorDir)) {
    try {
      const entries = await fsp.readdir(cursorDir);
      if (entries.length === 0) {
        await remove(cursorDir);
      }
    } catch {
      // ignore
    }
  }

  // Clean .gitignore
  await cleanGitignore(targetPath);

  log.blank();
  log.ok('Rade detached. Project cleaned.');
}

/**
 * Remove Rade entries from .gitignore.
 */
async function cleanGitignore(targetPath) {
  const gitignorePath = path.join(targetPath, '.gitignore');

  if (!(await exists(gitignorePath))) return;

  try {
    const content = await readText(gitignorePath);
    const marker = '# Rade generated';

    if (!content.includes(marker)) return;

    // Remove the entire Rade block
    const lines = content.split('\n');
    const result = [];
    let inRadeBlock = false;

    for (const line of lines) {
      if (line.trim() === marker) {
        inRadeBlock = true;
        continue;
      }
      if (inRadeBlock) {
        // End of Rade block on next comment or non-empty non-pattern line
        if (line.trim() === '' ) continue;
        if (line.startsWith('#') && !line.includes('Rade') && !line.includes('Backups') && !line.includes('keep .rade')) {
          inRadeBlock = false;
          result.push(line);
          continue;
        }
        // Still in Rade block
        continue;
      }
      result.push(line);
    }

    await writeText(gitignorePath, result.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
    log.ok('Cleaned .gitignore');
  } catch {
    // ignore
  }
}
