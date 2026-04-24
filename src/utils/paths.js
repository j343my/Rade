import os from 'node:os';
import path from 'node:path';

export const USER_RADE_DIR = path.join(os.homedir(), '.rade');
export const USER_IMPORTS_DIR = path.join(USER_RADE_DIR, 'imports');
