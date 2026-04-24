import path from 'node:path';
import tar from 'tar';
import { exists } from '../utils/fs.js';
import * as log from '../utils/log.js';

/**
 * Create a tar.gz backup of a directory.
 * @param {string} dirPath - directory to back up (e.g., /project/.agents)
 * @param {string} [outputDir] - where to store the backup (defaults to parent of dirPath)
 * @returns {Promise<string|null>} - path to the backup file, or null if nothing to back up
 */
export async function backupDirectory(dirPath, outputDir) {
  if (!(await exists(dirPath))) {
    return null;
  }

  const dirName = path.basename(dirPath);
  const parentDir = outputDir || path.dirname(dirPath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(parentDir, `${dirName}.backup.${timestamp}.tar.gz`);

  try {
    await tar.create(
      {
        gzip: true,
        file: backupFile,
        cwd: path.dirname(dirPath),
      },
      [dirName]
    );

    log.ok(`Backup created: ${path.basename(backupFile)}`);
    return backupFile;
  } catch (error) {
    log.err(`Failed to create backup: ${error.message}`);
    return null;
  }
}
