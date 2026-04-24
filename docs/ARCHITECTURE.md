# Rade Architecture

## Overview

Rade is a **convention-as-code** framework. It defines agent behavior (skills) and coding standards (rules) in a central repository, then generates tool-specific config files via `setup.sh`.

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
# Go Coding Standards
- Use gofmt...
```

The frontmatter serves two purposes:
1. **Cursor**: converted to `.mdc` frontmatter so Cursor applies rules to matching files.
2. **setup.sh**: reads globs/description dynamically — no hardcoded mapping.

### Project Context (`00-project-context.md.template`)

A fill-in-the-blank template describing the target project (tech stack, architecture, constraints). Loaded by agents before any work begins.

## Generation Pipeline (`setup.sh`)

```
┌──────────┐     ┌───────────┐
│ skills/  │────▶│           │──▶ .cursor/rules/rade-skill-*.mdc (alwaysApply)
│  *.yaml  │     │           │──▶ CLAUDE.md (bundled)
└──────────┘     │           │──▶ AGENTS.md (bundled)
                 │ setup.sh  │──▶ .agents/skills/*.yaml (native)
┌──────────┐     │           │
│ rules/   │────▶│           │──▶ .cursor/rules/*.mdc (with globs)
│  *.md    │     │           │──▶ CLAUDE.md (appended)
└──────────┘     │           │──▶ AGENTS.md (appended)
                 │           │──▶ .agents/rules/*.md (native)
                 └───────────┘
```

### How each tool is handled

| Tool | Skills | Rules | Format |
|------|--------|-------|--------|
| Cursor | Instructions → `.mdc` with `alwaysApply: true` | Body → `.mdc` with `globs` from frontmatter | Individual files |
| Claude Code | Instructions → `CLAUDE.md` | Body (stripped frontmatter) → `CLAUDE.md` | Single file |
| AGENTS.md | Instructions → `AGENTS.md` | Body (stripped frontmatter) → `AGENTS.md` | Single file |
| Antigravity | `.yaml` copied as-is | `.md` copied as-is | Native files |

## Adding a New Tool

To support a new agent tool:
1. Add a `setup_<tool>()` function in `setup.sh`.
2. Register it in `run_tool()`.
3. Document it in `README.md`.
