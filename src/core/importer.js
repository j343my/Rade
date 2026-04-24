import path from 'node:path';
import { execSync } from 'node:child_process';
import fsp from 'node:fs/promises';
import { ensureDir, exists, readText, writeText, listFiles } from '../utils/fs.js';
import * as log from '../utils/log.js';

// Heuristic: map file extensions to technology names and globs
const TECH_MAP = {
  '.go': { tech: 'Go', globs: '*.go' },
  '.rs': { tech: 'Rust', globs: '*.rs' },
  '.py': { tech: 'Python', globs: '*.py' },
  '.ts': { tech: 'TypeScript', globs: '*.ts, *.tsx' },
  '.tsx': { tech: 'TypeScript/React', globs: '*.ts, *.tsx, *.jsx' },
  '.js': { tech: 'JavaScript', globs: '*.js' },
  '.jsx': { tech: 'JavaScript/React', globs: '*.jsx' },
  '.sh': { tech: 'Bash', globs: '*.sh' },
  '.sql': { tech: 'SQL', globs: '*.sql' },
  '.yaml': { tech: 'YAML', globs: '*.yaml, *.yml' },
  '.yml': { tech: 'YAML', globs: '*.yaml, *.yml' },
  '.xml': { tech: 'XML', globs: '*.xml' },
  '.html': { tech: 'HTML', globs: '*.html' },
  '.css': { tech: 'CSS', globs: '*.css' },
  '.rb': { tech: 'Ruby', globs: '*.rb' },
  '.java': { tech: 'Java', globs: '*.java' },
  '.kt': { tech: 'Kotlin', globs: '*.kt' },
  '.swift': { tech: 'Swift', globs: '*.swift' },
  '.c': { tech: 'C', globs: '*.c, *.h' },
  '.cpp': { tech: 'C++', globs: '*.cpp, *.hpp, *.cc' },
};

/**
 * Import rules from a source: GitHub repo URL, raw URL, or local file.
 *
 * @param {string} source - URL or local path
 * @param {object} opts
 * @param {string} [opts.output] - custom output name
 * @param {string} opts.targetDir - directory to save imported rules
 * @returns {Promise<void>}
 */
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

/**
 * Clone a GitHub repo and extract rule files.
 */
async function importFromGitRepo(url, targetDir) {
  const repoName = path.basename(url, '.git');
  const destDir = path.join(targetDir, repoName);
  await ensureDir(destDir);

  const tmpDir = path.join('/tmp', `rade-import-${Date.now()}`);
  log.info(`Cloning ${url}...`);

  try {
    execSync(`git clone --depth 1 "${url}" "${tmpDir}"`, { stdio: 'pipe' });

    // Find .md, .mdc, or .cursorrules files
    const findCmd = `find "${tmpDir}" -maxdepth 3 -type f \\( -name "*.md" -o -name "*.mdc" -o -name ".cursorrules" \\)`;
    const files = execSync(findCmd, { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);

    let count = 0;
    for (const src of files) {
      let name = path.basename(src);
      if (name === '.cursorrules') name = 'cursorrules.md';
      if (name === 'README.md' || name === 'LICENSE.md') continue;
      await fsp.copyFile(src, path.join(destDir, name));
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

/**
 * Fetch a single rule from a raw URL.
 */
async function importFromUrl(url, targetDir, outputName) {
  log.info(`Fetching ${url}...`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const content = await response.text();
    const name = outputName || guessNameFromUrl(url);
    const filePath = path.join(targetDir, `${name}.md`);

    const enriched = addFrontmatter(content, url);
    await writeText(filePath, enriched);

    log.ok(`Imported rule: ${name}.md`);
  } catch (error) {
    log.err(`Failed to fetch URL: ${error.message}`);
    throw error;
  }
}

/**
 * Import a local file as a rule.
 */
async function importFromLocal(source, targetDir, outputName) {
  log.info(`Importing local file: ${source}`);
  const absSource = path.resolve(source);

  if (!(await exists(absSource))) {
    throw new Error(`File not found: ${absSource}`);
  }

  const content = await readText(absSource);
  const name = outputName || path.basename(absSource, path.extname(absSource));
  const filePath = path.join(targetDir, `${name}.md`);

  const enriched = addFrontmatter(content, absSource);
  await writeText(filePath, enriched);

  log.ok(`Imported rule: ${name}.md`);
}

/**
 * Add frontmatter to imported content if not already present.
 */
function addFrontmatter(content, source) {
  // Check if content already has frontmatter
  if (content.trimStart().startsWith('---')) {
    return content;
  }

  const tech = detectTech(content);
  const now = new Date().toISOString();

  const fm = [
    '---',
    `description: "Imported from ${path.basename(source)}"`,
  ];

  if (tech) {
    fm.push(`globs: "${tech.globs}"`);
  }

  fm.push(`source: "${source}"`);
  fm.push(`imported_at: "${now}"`);
  fm.push('---');
  fm.push('');

  return fm.join('\n') + content;
}

/**
 * Simple heuristic to detect technology from content.
 */
function detectTech(content) {
  const lower = content.toLowerCase();

  const patterns = [
    { match: /\bfunc\b.*\{|\bpackage\s+\w+/, tech: TECH_MAP['.go'] },
    { match: /\bfn\b.*->|\blet\s+mut\b|\bimpl\b/, tech: TECH_MAP['.rs'] },
    { match: /\bdef\b.*:|\bimport\s+\w+|\bclass\b.*:/, tech: TECH_MAP['.py'] },
    { match: /\binterface\b|\btype\b.*=|\b:\s*string\b|\b:\s*number\b/, tech: TECH_MAP['.ts'] },
    { match: /\buseState\b|\buseEffect\b|\bJSX\b|React/, tech: TECH_MAP['.tsx'] },
    { match: /\bSELECT\b.*\bFROM\b|\bINSERT\b|\bCREATE TABLE\b/i, tech: TECH_MAP['.sql'] },
    { match: /\bset -e|\bset -u|\bshellcheck\b|\bbash\b/i, tech: TECH_MAP['.sh'] },
    { match: /\bxml\b|\bxsd\b|<\?xml/i, tech: TECH_MAP['.xml'] },
  ];

  for (const { match, tech } of patterns) {
    if (match.test(content)) {
      return tech;
    }
  }

  return null;
}

/**
 * Guess a filename from a URL.
 */
function guessNameFromUrl(url) {
  const segments = url.split('/').filter(Boolean);
  const last = segments[segments.length - 1] || 'imported-rule';
  return last.replace(/\.(md|mdc|txt)$/, '');
}
