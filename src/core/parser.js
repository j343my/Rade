import yaml from 'js-yaml';
import { readText } from '../utils/fs.js';

/**
 * Parse a Markdown rule file with YAML frontmatter.
 * Returns { frontmatter: { description, globs, ... }, body: string }
 *
 * @param {string} filePath - absolute path to .md rule file
 * @returns {Promise<{ frontmatter: object, body: string }>}
 */
export async function parseRule(filePath) {
  const content = await readText(filePath);
  return parseRuleContent(content);
}

/**
 * Parse rule content string (frontmatter + body).
 * @param {string} content
 * @returns {{ frontmatter: object, body: string }}
 */
export function parseRuleContent(content) {
  const lines = content.split('\n');
  let fmStart = -1;
  let fmEnd = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      if (fmStart === -1) {
        fmStart = i;
      } else {
        fmEnd = i;
        break;
      }
    }
  }

  if (fmStart === -1 || fmEnd === -1) {
    // No frontmatter found — treat entire file as body
    return { frontmatter: {}, body: content };
  }

  const fmRaw = lines.slice(fmStart + 1, fmEnd).join('\n');
  const body = lines.slice(fmEnd + 1).join('\n').replace(/^\n+/, '');

  let frontmatter = {};
  try {
    frontmatter = yaml.load(fmRaw) || {};
  } catch {
    // If YAML parsing fails, return empty frontmatter
    frontmatter = {};
  }

  return { frontmatter, body };
}

/**
 * Parse a YAML skill file.
 * @param {string} filePath - absolute path to .yaml skill
 * @returns {Promise<object>}
 */
export async function parseSkill(filePath) {
  const content = await readText(filePath);
  return parseSkillContent(content);
}

/**
 * Parse skill YAML content.
 * @param {string} content
 * @returns {object}
 */
export function parseSkillContent(content) {
  try {
    return yaml.load(content) || {};
  } catch {
    return {};
  }
}
