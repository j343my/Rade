import path from 'node:path';
import fsp from 'node:fs/promises';
import { parseRule, parseSkill } from './parser.js';
import { ensureDir, listFiles, writeText, copyFile } from '../utils/fs.js';
import { USER_IMPORTS_DIR } from '../utils/paths.js';
import * as log from '../utils/log.js';

export const ALL_TOOLS = ['cursor', 'claude', 'antigravity', 'agents-md'];

/**
 * Parse a comma-separated tool list into a validated Set.
 * Returns all tools if input is falsy.
 * @param {string|string[]|null|undefined} input
 * @returns {Set<string>}
 */
export function parseTools(input) {
  if (!input || (Array.isArray(input) && input.length === 0)) {
    return new Set(ALL_TOOLS);
  }
  const raw = Array.isArray(input) ? input.join(',') : input;
  const requested = raw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  const invalid = requested.filter(t => !ALL_TOOLS.includes(t));
  if (invalid.length > 0) {
    throw new Error(`Unknown tool(s): ${invalid.join(', ')}. Valid options: ${ALL_TOOLS.join(', ')}`);
  }
  return new Set(requested);
}

/**
 * Generate tool-specific config files for a target project.
 * @param {object} opts
 * @param {string}      opts.radeRoot      - Rade source root
 * @param {string}      opts.targetPath    - target project path
 * @param {Set<string>} [opts.tools]       - which tools to generate (default: all)
 * @param {string[]}    [opts.excluded]    - rule filenames to exclude
 */
export async function generateAll(opts) {
  const { radeRoot, targetPath } = opts;
  const tools = opts.tools instanceof Set ? opts.tools : parseTools(opts.tools);
  const excluded = new Set(opts.excluded || []);

  const rulesDir = path.join(radeRoot, 'rules');
  const skillsDir = path.join(radeRoot, 'skills');

  const skills = await loadSkills(skillsDir);

  // Layer 1: built-in rules (rade-cli package)
  const builtinRules = await loadRules(rulesDir);

  // Layer 2: global user rules (~/.rade/imports/)
  const globalRules = await loadRules(USER_IMPORTS_DIR);

  // Layer 3: project-local imports (.agents/imports/)
  const projectRules = await loadRules(path.join(targetPath, '.agents', 'imports'));

  const allRules = [...builtinRules, ...globalRules, ...projectRules]
    .filter(r => !excluded.has(r.name));

  if (tools.has('cursor'))      await generateCursor(targetPath, allRules, skills, rulesDir);
  if (tools.has('claude'))      await generateClaude(targetPath, allRules, skills);
  if (tools.has('agents-md'))   await generateAgentsMd(targetPath, allRules, skills);
  if (tools.has('cursor') || tools.has('agents-md')) await generateCursorrules(targetPath);
  if (tools.has('antigravity')) await generateAntigravity(targetPath, rulesDir, skillsDir);
}

/**
 * Load all rule files from a directory (recursive).
 * @param {string} dir
 * @returns {Promise<Array<{file: string, name: string, frontmatter: object, body: string}>>}
 */
async function loadRules(dir) {
  const files = await listFiles(dir, { extensions: ['.md', '.mdc'], recursive: true });
  const results = [];

  for (const file of files) {
    const name = path.basename(file);
    if (name.endsWith('.template')) continue;

    try {
      const { frontmatter, body } = await parseRule(file);
      results.push({ file, name, frontmatter, body });
    } catch {
      log.warn(`Skipping unreadable rule: ${name}`);
    }
  }

  return results;
}

/**
 * Load all skill files from a directory.
 * @param {string} dir
 * @returns {Promise<Array<{file: string, name: string, data: object}>>}
 */
async function loadSkills(dir) {
  const files = await listFiles(dir, { extensions: ['.yaml', '.yml'] });
  const results = [];

  for (const file of files) {
    const name = path.basename(file, path.extname(file));
    try {
      const data = await parseSkill(file);
      results.push({ file, name, data });
    } catch {
      log.warn(`Skipping unreadable skill: ${name}`);
    }
  }

  return results;
}

/**
 * Generate .cursor/rules/*.mdc files.
 */
async function generateCursor(targetPath, rules, skills, rulesDir) {
  const cursorDir = path.join(targetPath, '.cursor', 'rules');
  await ensureDir(cursorDir);

  // 1. One .mdc per rule
  for (const rule of rules) {
    const mdcName = rule.name.replace(/\.md$/, '.mdc');
    const globs = rule.frontmatter.globs || '';
    const description = rule.frontmatter.description || 'Coding standards';

    const lines = [
      '---',
      `description: "${description}"`,
    ];
    if (globs) {
      lines.push(`globs: "${globs}"`);
    }
    lines.push('alwaysApply: false');
    lines.push('---');
    lines.push('');
    lines.push(rule.body);

    await writeText(path.join(cursorDir, mdcName), lines.join('\n'));
  }

  // 2. One .mdc per skill (alwaysApply: true)
  for (const skill of skills) {
    const displayName = skill.data.display_name || skill.name;
    const shortDesc = skill.data.short_description || '';
    const instructions = skill.data.instructions || '';

    const lines = [
      '---',
      `description: "${displayName}: ${shortDesc}"`,
      'alwaysApply: true',
      '---',
      '',
      `# ${displayName}`,
      '',
      instructions,
    ];

    await writeText(path.join(cursorDir, `rade-skill-${skill.name}.mdc`), lines.join('\n'));
  }

  // 3. Project context template as alwaysApply
  const templatePath = path.join(rulesDir, '00-project-context.md.template');
  try {
    const templateContent = await fsp.readFile(templatePath, 'utf-8');
    const lines = [
      '---',
      'description: "Project context — always loaded"',
      'alwaysApply: true',
      '---',
      '',
      templateContent,
    ];
    await writeText(path.join(cursorDir, '00-project-context.mdc'), lines.join('\n'));
  } catch {
    // Template not found, skip
  }

  const count = (await listFiles(cursorDir, { extensions: ['.mdc'] })).length;
  log.ok(`Cursor: generated ${count} .mdc files in .cursor/rules/`);
}

/**
 * Generate a single CLAUDE.md with skills + rules.
 */
async function generateClaude(targetPath, rules, skills) {
  const lines = [
    `<!-- Auto-generated by Rade on ${new Date().toISOString()} -->`,
    '',
  ];

  // Inject skill instructions
  for (const skill of skills) {
    const displayName = skill.data.display_name || skill.name;
    const instructions = skill.data.instructions || '';
    lines.push(`# ${displayName}`);
    lines.push('');
    lines.push(instructions);
    lines.push('');
  }

  // Inject all rules (body only)
  for (const rule of rules) {
    lines.push('---');
    lines.push('');
    lines.push(rule.body);
    lines.push('');
  }

  await writeText(path.join(targetPath, 'CLAUDE.md'), lines.join('\n'));
  log.ok('Claude Code: generated CLAUDE.md (skills + rules)');
}

/**
 * Generate a single AGENTS.md with skills + rules.
 */
async function generateAgentsMd(targetPath, rules, skills) {
  const lines = [
    `<!-- Auto-generated by Rade on ${new Date().toISOString()} -->`,
    '',
  ];

  for (const skill of skills) {
    const displayName = skill.data.display_name || skill.name;
    const instructions = skill.data.instructions || '';
    lines.push(`# ${displayName}`);
    lines.push('');
    lines.push(instructions);
    lines.push('');
  }

  for (const rule of rules) {
    lines.push('---');
    lines.push('');
    lines.push(rule.body);
    lines.push('');
  }

  await writeText(path.join(targetPath, 'AGENTS.md'), lines.join('\n'));
  log.ok('AGENTS.md: generated at project root');
}

/**
 * Generate .cursorrules as a symlink to AGENTS.md.
 */
async function generateCursorrules(targetPath) {
  const linkPath = path.join(targetPath, '.cursorrules');
  const agentsPath = path.join(targetPath, 'AGENTS.md');

  try {
    await fsp.unlink(linkPath).catch(() => {});
    await fsp.symlink('AGENTS.md', linkPath);
    log.ok('.cursorrules: symlinked to AGENTS.md');
  } catch (error) {
    // If symlink fails (e.g., Windows), copy instead
    try {
      await fsp.copyFile(agentsPath, linkPath);
      log.ok('.cursorrules: copied from AGENTS.md');
    } catch {
      log.warn('.cursorrules: could not create (AGENTS.md may not exist yet)');
    }
  }
}

/**
 * Generate .agents/ directory with native rules and skills for Antigravity.
 */
async function generateAntigravity(targetPath, rulesDir, skillsDir) {
  const agRules = path.join(targetPath, '.agents', 'rules');
  const agSkills = path.join(targetPath, '.agents', 'skills');
  await ensureDir(agRules);
  await ensureDir(agSkills);

  // Copy rules
  const ruleFiles = await listFiles(rulesDir, { extensions: ['.md', '.mdc'], recursive: true });
  for (const file of ruleFiles) {
    const name = path.basename(file);
    if (name.endsWith('.template')) continue;
    await copyFile(file, path.join(agRules, name));
  }

  // Copy context template
  const templatePath = path.join(rulesDir, '00-project-context.md.template');
  try {
    await copyFile(templatePath, path.join(agRules, '00-project-context.md.template'));
  } catch {
    // not found, skip
  }

  // Copy skills
  const skillFiles = await listFiles(skillsDir, { extensions: ['.yaml', '.yml'] });
  for (const file of skillFiles) {
    await copyFile(file, path.join(agSkills, path.basename(file)));
  }

  log.ok('Antigravity: installed in .agents/{rules,skills}/');
}
