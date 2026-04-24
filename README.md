<p align="center">
  <img src="assets/rade.png" alt="Rade" width="200" />
</p>

# Rade

**Infrastructure for AI agents.** Standardize conventions across tools, languages, and projects. Built to scale: add rules for any tech.

---

## Why Rade?

AI coding agents are powerful, but without shared conventions they produce inconsistent, hard-to-maintain code. Every new project reinvents the same guardrails from scratch.

**Rade solves this.** Define your skills and rules once in a central repo. Run `setup.sh` to generate the config files your agent tool expects. Standards stay versioned, auditable, and shared across your team.

## Features

- **Polyglot Skills** — YAML-based skill definitions with full agent instructions (tech detection, rule loading, response format).
- **Per-technology Rules** — Dedicated coding standards with frontmatter (description + globs) for each language.
- **Multi-tool Generation** — One source of truth generates configs for Cursor, Claude Code, Antigravity, and AGENTS.md.
- **Versioned & Auditable** — All rules live in Git. Review changes via PRs, track history, roll back.
- **Extensible** — Add a new technology in minutes: create a `.md` file with frontmatter, done.

## Quick Start

```bash
# 1. Clone Rade
git clone https://github.com/your-org/rade.git

# 2. Generate config for your project
./rade/setup.sh ~/my-project

# 3. (Optional) Generate a project context template
./rade/setup.sh ~/my-project --context
```

### Target a specific tool (or several)

```bash
./setup.sh ~/my-project --tool cursor              # Cursor only
./setup.sh ~/my-project --tool cursor,claude        # Cursor + Claude Code
./setup.sh ~/my-project --tool cursor --tool claude # Same thing
./setup.sh ~/my-project --tool agents-md            # Single AGENTS.md file
./setup.sh ~/my-project                             # All tools (default)
```

### Importing Rules from GitHub

Rade can import rules from external repositories (like [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules)) and integrate them into your project.

```bash
./setup.sh ~/my-project --import https://github.com/PatrickJS/awesome-cursorrules
```

Imported rules are stored in `rules/imported/<repo-name>/` and are automatically included in all generated configurations.

### What gets generated

| Tool | Output | Format |
|------|--------|--------|
| Cursor | `.cursor/rules/*.mdc` | One `.mdc` per rule (with globs) + one per skill (`alwaysApply: true`) |
| Claude Code | `CLAUDE.md` | Single file: skill instructions + all rules bundled |
| Antigravity | `.agents/{rules,skills}/` | Native `.md` + `.yaml` files copied |
| AGENTS.md | `AGENTS.md` | Single file: skill instructions + all rules bundled |

## Supported Tools

| Tool | Status |
|------|--------|
| [Cursor](https://cursor.sh) | ✅ Supported |
| [Claude Code](https://claude.ai) | ✅ Supported |
| [Antigravity](https://antigravity.dev) | ✅ Supported |
| AGENTS.md | ✅ Supported |
| [Windsurf](https://windsurf.run) | 🚧 Work in progress |

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

## Adding a New Technology

1. Create `rules/my-tech.md` with frontmatter:
   ```markdown
   ---
   description: "My Tech coding standards"
   globs: "*.ext"
   ---
   # My Tech Coding Standards
   - ...
   ```
2. Run `./setup.sh` — the new rule is picked up automatically.
3. Open a PR — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Repository Structure

```
rade/
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CHANGELOG.md
├── ROADMAP.md
├── .gitignore
├── setup.sh                  # ← the generator
├── assets/
│   └── rade.png
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
├── examples/
│   └── custom-project/
│       └── README.md
└── docs/
    └── ARCHITECTURE.md
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)

## Links

- [GitHub Repository](https://github.com/j343my/Rade)
- [Documentation](docs/ARCHITECTURE.md)
- [Windsurf](https://windsurf.run)
