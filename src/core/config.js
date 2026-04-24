import path from 'node:path';
import { exists, readJSON, writeJSON } from '../utils/fs.js';

const CONFIG_FILENAME = 'config.json';

/**
 * Get the path to .rade/config.json for a project.
 * @param {string} projectPath
 * @returns {string}
 */
export function configPath(projectPath) {
  return path.join(projectPath, '.rade', CONFIG_FILENAME);
}

/**
 * Check if a project has a Rade config.
 * @param {string} projectPath
 * @returns {Promise<boolean>}
 */
export async function hasConfig(projectPath) {
  return exists(configPath(projectPath));
}

/**
 * Read the Rade config for a project.
 * @param {string} projectPath
 * @returns {Promise<object>}
 */
export async function readConfig(projectPath) {
  const cfgPath = configPath(projectPath);
  if (!(await exists(cfgPath))) {
    throw new Error(`No Rade config found at ${cfgPath}. Run "rade attach" first.`);
  }
  return readJSON(cfgPath);
}

/**
 * Write / update the Rade config.
 * @param {string} projectPath
 * @param {object} config
 */
export async function writeConfig(projectPath, config) {
  await writeJSON(configPath(projectPath), config);
}

/**
 * Create a fresh config object.
 * @param {object} opts
 * @param {string} opts.radeVersion - CLI version
 * @param {string} [opts.rulesVersion] - commit hash or version
 * @returns {object}
 */
export function createConfig(opts = {}) {
  const now = new Date().toISOString();
  return {
    version: '1.0.0',
    rade_version: opts.radeVersion || '1.0.0',
    attached_at: now,
    last_synced: now,
    rules_origin: 'rade',
    rules_version: opts.rulesVersion || 'local',
    custom_rules: [],
    excluded_rules: [],
    overrides: {},
  };
}
