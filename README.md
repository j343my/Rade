# Rade

**Infrastructure for AI agents. Attach Rade to any project.**

[![npm version](https://img.shields.io/npm/v/rade)](https://www.npmjs.com/package/rade)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm downloads](https://img.shields.io/npm/dm/rade)](https://www.npmjs.com/package/rade)

---

## Why Rade?

AI coding agents are powerful, but without shared conventions they produce inconsistent, hard-to-maintain code. Every new project reinvents the same guardrails from scratch.

**Rade solves this.** Define your skills and rules once in a central repo. Run `rade attach` to generate the config files your agent tools expect. Standards stay versioned, auditable, and shared across your team.

## Features

- **Polyglot Skills** — YAML-based skill definitions with full agent instructions (tech detection, rule loading, response format).
- **Per-technology Rules** — Dedicated coding standards with frontmatter (`description` + `globs`) for each language.
- **Multi-tool Generation** — One source of truth generates configs for Cursor, Claude Code, Antigravity, and AGENTS.md.
- **Versioned & Auditable** — All rules live in Git. Review changes via PRs, track history, roll back.
- **Extensible** — Add a new technology in minutes: create a `.md` file with frontmatter, done.

## Quick Start

```bash
npm install -g rade
cd my-project
rade attach .
```

Or without installing:

```bash
npx rade attach .
```

## Supported Tools

| Tool | Status |
|------|--------|
| [Cursor](https://cursor.sh) | ✅ Supported |
| [Claude Code](https://claude.ai/code) | ✅ Supported |
| [Antigravity](https://antigravity.dev) | ✅ Supported |
| AGENTS.md | ✅ Supported |
| [Windsurf](https://windsurf.run) | ⏳ Planned |

## Languages & Technologies Covered

| Language / Tech | Rule file | Globs |
|-----------------|-----------|-------|
| Go | [`go.md`](rules/go.md) | `*.go` |
| Bash | [`bash.md`](rules/bash.md) | `*.sh` |
| SQL | [`sql.md`](rules/sql.md) | `*.sql` |
| YAML | [`yaml.md`](rules/yaml.md) | `*.yaml, *.yml` |
| TypeScript / React | [`typescript-react.md`](rules/typescript-react.md) | `*.ts, *.tsx, *.jsx` |
| Frontend vanilla | [`frontend-vanilla.md`](rules/frontend-vanilla.md) | `*.html, *.js, *.css` |
| XML | [`xml.md`](rules/xml.md) | `*.xml` |

## CLI Commands

| Command | Description |
|---------|-------------|
| `rade attach [path]` | Attach Rade to a project — generates all configs |
| `rade sync` | Check for rule updates and apply them |
| `rade check` | Show what has changed without modifying anything |
| `rade update` | Pull latest rules and regenerate all configs |
| `rade import <source>` | Import a rule from a URL, GitHub repo, or local file |
| `rade detach` | Remove Rade from the current project |

### What gets generated

| Tool | Output | Format |
|------|--------|--------|
| Cursor | `.cursor/rules/*.mdc` | One `.mdc` per rule (with globs) + one per skill (`alwaysApply: true`) |
| Claude Code | `CLAUDE.md` | Skill instructions + all rules bundled |
| Antigravity | `.agents/{rules,skills}/` | Native `.md` + `.yaml` files copied |
| AGENTS.md | `AGENTS.md` | Skill instructions + all rules bundled |

## Adding a New Technology

1. Create `rules/<technology>.md` with frontmatter:
   ```markdown
   ---
   description: "My Tech coding standards"
   globs: "*.ext"
   ---
   # My Tech Coding Standards
   - ...
   ```
2. Open a PR — see [CONTRIBUTING.md](CONTRIBUTING.md).
3. After merging, users get the new rule on the next `rade sync`.

## Repository Structure

```
rade/
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CHANGELOG.md
├── ROADMAP.md
├── package.json
├── bin/
│   └── rade.js               # CLI entry point
├── src/
│   ├── index.js              # command registration
│   ├── cli/                  # attach, sync, check, update, import, detach
│   ├── core/                 # parser, generator, importer, syncer, backup, config
│   └── utils/                # fs, log, prompt helpers
├── skills/
│   ├── developer.yaml        # polyglot developer skill
│   └── tester.yaml           # polyglot tester skill
├── rules/
│   ├── 00-project-context.md.template
│   ├── go.md
│   ├── bash.md
│   ├── sql.md
│   ├── yaml.md
│   ├── typescript-react.md
│   ├── frontend-vanilla.md
│   └── xml.md
├── imports/                  # externally imported rules
├── examples/
│   └── README.md
└── docs/
    └── ARCHITECTURE.md
```

## Testing Locally

```bash
git clone https://github.com/your-org/rade.git
cd rade
npm install
npm link

# In any other project:
cd ~/my-project
rade attach .
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
