import path from 'node:path';
import { execFileSync } from 'node:child_process';
import fsp from 'node:fs/promises';
import { ensureDir, exists, readText, writeText, listFiles } from '../utils/fs.js';
import * as log from '../utils/log.js';

const TECH_MAP = {
  '.go':   { globs: '*.go' },
  '.rs':   { globs: '*.rs' },
  '.py':   { globs: '*.py' },
  '.ts':   { globs: '*.ts, *.tsx' },
  '.tsx':  { globs: '*.ts, *.tsx, *.jsx' },
  '.js':   { globs: '*.js' },
  '.jsx':  { globs: '*.jsx' },
  '.sh':   { globs: '*.sh' },
  '.sql':  { globs: '*.sql' },
  '.yaml': { globs: '*.yaml, *.yml' },
  '.yml':  { globs: '*.yaml, *.yml' },
  '.xml':  { globs: '*.xml' },
  '.html': { globs: '*.html' },
  '.css':  { globs: '*.css' },
  '.rb':   { globs: '*.rb' },
  '.java': { globs: '*.java' },
  '.kt':   { globs: '*.kt' },
  '.swift':{ globs: '*.swift' },
  '.c':    { globs: '*.c, *.h' },
  '.cpp':  { globs: '*.cpp, *.hpp, *.cc' },
};

export async function importRule(source, opts) {
  const { output, targetDir } = opts;
  await ensureDir(targetDir);

  if (source.startsWith('http://') || source.startsWith('https://')) {
    if (source.includes('github.com') && !source.includes('raw.githubusercontent.com')) {
      await importFromGitRepo(source, targetDir);
    } else {
      await importFromUrl(source, targetDir, output);
    }
  } else {
    await importFromLocal(source, targetDir, output);
  }
}

async function importFromGitRepo(url, targetDir) {
  const repoName = path.basename(url, '.git');
  const destDir = path.join(targetDir, repoName);
  await ensureDir(destDir);

  const tmpDir = path.join('/tmp', `rade-import-${Date.now()}`);
  log.info(`Cloning ${url}...`);

  try {
    // execFileSync avoids shell interpolation — no injection risk from url
    execFileSync('git', ['clone', '--depth', '1', url, tmpDir], { stdio: 'pipe' });

    const files = await listFiles(tmpDir, { extensions: ['.md', '.mdc'], recursive: true });

    let count = 0;
    for (const src of files) {
      let name = path.basename(src);
      if (name === 'README.md' || name === 'LICENSE.md') continue;
      await fsp.copyFile(src, path.join(destDir, name));
      count++;
    }

    // Also grab .cursorrules if present
    const cursorrules = path.join(tmpDir, '.cursorrules');
    if (await exists(cursorrules)) {
      await fsp.copyFile(cursorrules, path.join(destDir, 'cursorrules.md'));
      count++;
    }

    log.ok(`Imported ${count} rule(s) into imports/${repoName}/`);
  } catch (error) {
    log.err(`Failed to clone repository: ${error.message}`);
    throw error;
  } finally {
    await fsp.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function importFromUrl(url, targetDir, outputName) {
  log.info(`Fetching ${url}...`);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const content = await response.text();
    const name = outputName || guessNameFromUrl(url);
    await writeText(path.join(targetDir, `${name}.md`), addFrontmatter(content, url));
    log.ok(`Imported rule: ${name}.md`);
  } catch (error) {
    log.err(`Failed to fetch URL: ${error.message}`);
    throw error;
  }
}

async function importFromLocal(source, targetDir, outputName) {
  log.info(`Importing local file: ${source}`);
  const absSource = path.resolve(source);

  if (!(await exists(absSource))) throw new Error(`File not found: ${absSource}`);

  const content = await readText(absSource);
  const name = outputName || path.basename(absSource, path.extname(absSource));
  await writeText(path.join(targetDir, `${name}.md`), addFrontmatter(content, absSource));
  log.ok(`Imported rule: ${name}.md`);
}

function addFrontmatter(content, source) {
  if (content.trimStart().startsWith('---')) return content;

  const tech = detectTech(content);
  const now = new Date().toISOString();

  const lines = [
    '---',
    `description: "Imported from ${path.basename(source)}"`,
    ...(tech ? [`globs: "${tech.globs}"`] : []),
    `source: "${source}"`,
    `imported_at: "${now}"`,
    '---',
    '',
  ];

  return lines.join('\n') + content;
}

function detectTech(content) {
  const patterns = [
    [/\bfunc\b.*\{|\bpackage\s+\w+/, '.go'],
    [/\bfn\b.*->|\blet\s+mut\b|\bimpl\b/, '.rs'],
    [/\bdef\b.*:|\bimport\s+\w+|\bclass\b.*:/, '.py'],
    [/\buseState\b|\buseEffect\b|\bJSX\b|React/, '.tsx'],
    [/\binterface\b|\btype\b.*=|\b:\s*string\b|\b:\s*number\b/, '.ts'],
    [/\bSELECT\b.*\bFROM\b|\bINSERT\b|\bCREATE TABLE\b/i, '.sql'],
    [/\bset -e|\bset -u|\bshellcheck\b|\bbash\b/i, '.sh'],
    [/\bxml\b|\bxsd\b|<\?xml/i, '.xml'],
  ];

  for (const [pattern, ext] of patterns) {
    if (pattern.test(content)) return TECH_MAP[ext];
  }
  return null;
}

function guessNameFromUrl(url) {
  const last = url.split('/').filter(Boolean).at(-1) || 'imported-rule';
  return last.replace(/\.(md|mdc|txt)$/, '');
}
