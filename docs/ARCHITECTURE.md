# Rade Architecture

## Overview

Rade is a **convention-as-code** framework. It defines agent behavior (skills) and coding standards (rules) in a central repository, then generates tool-specific config files via the `rade` CLI.

## Core Concepts

### Skills (`skills/*.yaml`)

Skills define **how an agent behaves**. Each skill contains:
- **Metadata**: `display_name`, `short_description`, `brand_color`.
- **Instructions**: a full prompt injected into the agent's context, defining the workflow, response format, and decision logic.
- **Model config**: recommended model, temperature, autonomy level.

Example workflow (from `developer.yaml`):
1. Detect the technology from file extension.
2. Find the matching rule in `.agents/rules/`.
3. Apply the rule, or warn if none exists.

### Rules (`rules/*.md`)

Rules define **what conventions to follow** for a specific technology. Each rule file has:
- **Frontmatter** with `description` (human-readable) and `globs` (file patterns).
- **Body** with the actual coding standards.

```markdown
---
description: "Go coding standards"
globs: "*.go"
---
# Go — Coding Standards
- Use gofmt...
```

The frontmatter serves two purposes:
1. **Cursor**: converted to `.mdc` frontmatter so Cursor applies rules to matching files.
2. **Generator**: reads globs/description dynamically — no hardcoded mapping.

### Project Context (`00-project-context.md.template`)

A fill-in-the-blank template describing the target project (tech stack, architecture, constraints). Loaded by agents before any work begins.

## Project Attachment (`.rade/config.json`)

When `rade attach` runs, it creates `.rade/config.json` in the target project:

```json
{
  "version": "1.0.0",
  "rade_version": "1.0.0",
  "attached_at": "2025-01-01T00:00:00.000Z",
  "last_synced": "2025-01-01T00:00:00.000Z",
  "rules_origin": "rade",
  "rules_version": "local",
  "custom_rules": [],
  "excluded_rules": [],
  "overrides": {}
}
```

This config is the source of truth for sync operations.

## Generation Pipeline

```
┌──────────┐     ┌─────────────┐
│ skills/  │────▶│             │──▶ .cursor/rules/rade-skill-*.mdc (alwaysApply)
│  *.yaml  │     │             │──▶ CLAUDE.md (skills section)
└──────────┘     │  generator  │──▶ AGENTS.md (skills section)
                 │   .js       │──▶ .agents/skills/*.yaml (native)
┌──────────┐     │             │
│ rules/   │────▶│             │──▶ .cursor/rules/*.mdc (with globs)
│  *.md    │     │             │──▶ CLAUDE.md (rules appended)
└──────────┘     │             │──▶ AGENTS.md (rules appended)
                 │             │──▶ .agents/rules/*.md (native)
                 └─────────────┘
```

### How each tool is handled

| Tool | Skills | Rules | Format |
|------|--------|-------|--------|
| Cursor | Instructions → `.mdc` with `alwaysApply: true` | Body → `.mdc` with `globs` from frontmatter | Individual files |
| Claude Code | Instructions → `CLAUDE.md` | Body (stripped frontmatter) → `CLAUDE.md` | Single file |
| AGENTS.md | Instructions → `AGENTS.md` | Body (stripped frontmatter) → `AGENTS.md` | Single file |
| Antigravity | `.yaml` copied as-is | `.md` copied as-is | Native files |

## Sync Mechanism

`rade sync` / `rade check` use `src/core/syncer.js`:

1. Read `.rade/config.json` to get the current state.
2. List rules in the Rade source (`rules/`) and in the project (`.agents/rules/`).
3. Compare rule bodies (not frontmatter) to detect modifications.
4. Report new, modified, deleted, and unchanged rules.
5. On confirmation, copy new/modified rules and regenerate all configs.

## Override System

Planned for v2.0. Projects will be able to place `.rade/overrides.md` with patches applied on top of shared rules before generation.

## Adding a New Tool

To support a new agent tool:
1. Add a `generate<Tool>()` function in `src/core/generator.js`.
2. Call it from `generateAll()`.
3. Document it in `README.md`.
