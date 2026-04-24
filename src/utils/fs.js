import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

/**
 * Ensure a directory exists, creating parents as needed.
 * @param {string} dirPath
 */
export async function ensureDir(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true });
}

/**
 * Check if a path exists.
 * @param {string} p
 * @returns {Promise<boolean>}
 */
export async function exists(p) {
  try {
    await fsp.access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read a JSON file and return parsed object.
 * @param {string} filePath
 * @returns {Promise<object>}
 */
export async function readJSON(filePath) {
  const raw = await fsp.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Write an object as formatted JSON.
 * @param {string} filePath
 * @param {object} data
 */
export async function writeJSON(filePath, data) {
  await ensureDir(path.dirname(filePath));
  await fsp.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * Copy a file, creating parent dirs as needed.
 * @param {string} src
 * @param {string} dest
 */
export async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fsp.copyFile(src, dest);
}

/**
 * Recursively copy a directory.
 * @param {string} src  - source directory
 * @param {string} dest - destination directory
 * @param {object} [opts]
 * @param {string[]} [opts.exclude] - basenames to skip
 */
export async function copyDir(src, dest, opts = {}) {
  const exclude = opts.exclude || [];
  await ensureDir(dest);
  const entries = await fsp.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    if (exclude.includes(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, opts);
    } else {
      await fsp.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Read a text file.
 * @param {string} filePath
 * @returns {Promise<string>}
 */
export async function readText(filePath) {
  return fsp.readFile(filePath, 'utf-8');
}

/**
 * Write a text file, creating parent dirs as needed.
 * @param {string} filePath
 * @param {string} content
 */
export async function writeText(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await fsp.writeFile(filePath, content, 'utf-8');
}

/**
 * List files in a directory matching optional extensions.
 * @param {string} dirPath
 * @param {object} [opts]
 * @param {string[]} [opts.extensions] - e.g. ['.md', '.yaml']
 * @param {boolean} [opts.recursive] - recurse into subdirs
 * @returns {Promise<string[]>} - absolute paths
 */
export async function listFiles(dirPath, opts = {}) {
  const extensions = opts.extensions || [];
  const recursive = opts.recursive || false;
  const results = [];

  if (!(await exists(dirPath))) return results;

  const entries = await fsp.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory() && recursive) {
      const sub = await listFiles(fullPath, opts);
      results.push(...sub);
    } else if (entry.isFile()) {
      if (extensions.length === 0 || extensions.some(ext => entry.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

/**
 * Remove a file or directory recursively.
 * @param {string} p
 */
export async function remove(p) {
  await fsp.rm(p, { recursive: true, force: true });
}
