# Examples

This directory will contain example projects showing how Rade is used in practice.

## Planned examples

- `go-api/` — Go REST API with Rade attached (Go + SQL + YAML rules)
- `react-app/` — TypeScript/React app with Rade attached
- `fullstack/` — Full-stack project using multiple rules

## Try it now

```bash
npm install -g rade

mkdir my-test-project && cd my-test-project
git init
rade attach .
```

Then open the generated files:
- `AGENTS.md` — bundled rules for ChatGPT, Gemini, and other AGENTS.md-compatible tools
- `CLAUDE.md` — Claude Code config
- `.cursor/rules/` — per-language Cursor rules
- `.agents/` — native Antigravity config
