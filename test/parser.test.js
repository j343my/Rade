import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseRuleContent, parseSkillContent } from '../src/core/parser.js';

describe('parseRuleContent', () => {
  it('parses frontmatter and body', () => {
    const input = `---
description: "Go coding standards"
globs: "*.go"
---

# Go Rules

- Rule one
`;
    const { frontmatter, body } = parseRuleContent(input);
    assert.equal(frontmatter.description, 'Go coding standards');
    assert.equal(frontmatter.globs, '*.go');
    assert.ok(body.includes('# Go Rules'));
    assert.ok(body.includes('- Rule one'));
  });

  it('returns empty frontmatter when none present', () => {
    const input = '# Just a body\n\n- rule\n';
    const { frontmatter, body } = parseRuleContent(input);
    assert.deepEqual(frontmatter, {});
    assert.equal(body, input);
  });

  it('strips leading newlines from body', () => {
    const input = '---\ndescription: "test"\n---\n\n\nbody here\n';
    const { body } = parseRuleContent(input);
    assert.ok(!body.startsWith('\n'));
    assert.ok(body.startsWith('body'));
  });

  it('handles malformed YAML frontmatter gracefully', () => {
    const input = '---\n: invalid: yaml: here\n---\nbody\n';
    const { frontmatter, body } = parseRuleContent(input);
    assert.deepEqual(frontmatter, {});
    assert.equal(body, 'body\n');
  });

  it('handles frontmatter with only description', () => {
    const input = '---\ndescription: "Solo desc"\n---\ncontent\n';
    const { frontmatter } = parseRuleContent(input);
    assert.equal(frontmatter.description, 'Solo desc');
    assert.equal(frontmatter.globs, undefined);
  });
});

describe('parseSkillContent', () => {
  it('parses a valid skill YAML', () => {
    const input = `display_name: "Developer"
short_description: "Polyglot developer"
model: "claude-sonnet-4-6"
temperature: 0.3
instructions: |
  Do stuff.
`;
    const skill = parseSkillContent(input);
    assert.equal(skill.display_name, 'Developer');
    assert.equal(skill.model, 'claude-sonnet-4-6');
    assert.equal(skill.temperature, 0.3);
    assert.ok(skill.instructions.includes('Do stuff'));
  });

  it('returns empty object for invalid YAML', () => {
    const result = parseSkillContent('{{{{invalid');
    assert.deepEqual(result, {});
  });

  it('returns empty object for empty content', () => {
    const result = parseSkillContent('');
    assert.deepEqual(result, {});
  });
});
