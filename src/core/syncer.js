import path from 'node:path';
import { readConfig } from './config.js';
import { listFiles } from '../utils/fs.js';
import { parseRule } from './parser.js';
import { RADE_ROOT } from '../index.js';
import * as log from '../utils/log.js';

/**
 * Compare the current project rules with the Rade source rules.
 * Returns a diff summary: new, modified, deleted, unchanged.
 *
 * @param {string} projectPath
 * @returns {Promise<{
 *   newRules: string[],
 *   modifiedRules: string[],
 *   deletedRules: string[],
 *   unchanged: string[],
 *   config: object
 * }>}
 */
export async function computeDiff(projectPath) {
  const config = await readConfig(projectPath);

  const sourceRulesDir = path.join(RADE_ROOT, 'rules');
  const projectRulesDir = path.join(projectPath, '.agents', 'rules');

  // List source rules
  const sourceFiles = await listFiles(sourceRulesDir, { extensions: ['.md'], recursive: true });
  const sourceNames = new Set(
    sourceFiles
      .map(f => path.basename(f))
      .filter(n => !n.endsWith('.template'))
  );

  // List project rules
  const projectFiles = await listFiles(projectRulesDir, { extensions: ['.md'], recursive: true });
  const projectNames = new Set(
    projectFiles
      .map(f => path.basename(f))
      .filter(n => !n.endsWith('.template'))
  );

  const newRules = [];
  const modifiedRules = [];
  const deletedRules = [];
  const unchanged = [];

  // Check for new and modified rules
  for (const name of sourceNames) {
    if (!projectNames.has(name)) {
      newRules.push(name);
    } else {
      // Compare content
      const srcFile = sourceFiles.find(f => path.basename(f) === name);
      const prjFile = projectFiles.find(f => path.basename(f) === name);
      try {
        const srcRule = await parseRule(srcFile);
        const prjRule = await parseRule(prjFile);
        if (srcRule.body.trim() !== prjRule.body.trim()) {
          modifiedRules.push(name);
        } else {
          unchanged.push(name);
        }
      } catch {
        modifiedRules.push(name);
      }
    }
  }

  // Check for deleted rules
  for (const name of projectNames) {
    if (!sourceNames.has(name)) {
      deletedRules.push(name);
    }
  }

  return { newRules, modifiedRules, deletedRules, unchanged, config };
}

/**
 * Display the diff summary to the user.
 * @param {object} diff
 */
export function displayDiff(diff) {
  const { newRules, modifiedRules, deletedRules, unchanged } = diff;

  if (newRules.length === 0 && modifiedRules.length === 0 && deletedRules.length === 0) {
    log.ok('Everything is up to date.');
    return;
  }

  if (newRules.length > 0) {
    log.ok('New rules:');
    for (const name of newRules) {
      log.info(`  + ${name}`);
    }
  }

  if (modifiedRules.length > 0) {
    log.warn('Modified rules:');
    for (const name of modifiedRules) {
      log.info(`  ~ ${name}`);
    }
  }

  if (deletedRules.length > 0) {
    log.warn('Removed from source:');
    for (const name of deletedRules) {
      log.info(`  - ${name}`);
    }
  }

  if (unchanged.length > 0) {
    log.dim(`  ${unchanged.length} rule(s) unchanged`);
  }
}
