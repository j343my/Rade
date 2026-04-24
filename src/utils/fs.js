import fsp from 'node:fs/promises';
import path from 'node:path';

export async function ensureDir(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true });
}

// lstat (not access) so broken symlinks are still detected as existing
export async function exists(p) {
  try {
    await fsp.lstat(p);
    return true;
  } catch {
    return false;
  }
}

export async function readJSON(filePath) {
  const raw = await fsp.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

export async function writeJSON(filePath, data) {
  await ensureDir(path.dirname(filePath));
  await fsp.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fsp.copyFile(src, dest);
}

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

export async function readText(filePath) {
  return fsp.readFile(filePath, 'utf-8');
}

export async function writeText(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await fsp.writeFile(filePath, content, 'utf-8');
}

export async function listFiles(dirPath, opts = {}) {
  const extensions = opts.extensions || [];
  const recursive = opts.recursive || false;
  const results = [];

  if (!(await exists(dirPath))) return results;

  const entries = await fsp.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory() && recursive) {
      results.push(...await listFiles(fullPath, opts));
    } else if (entry.isFile()) {
      if (extensions.length === 0 || extensions.some(ext => entry.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

export async function remove(p) {
  await fsp.rm(p, { recursive: true, force: true });
}
