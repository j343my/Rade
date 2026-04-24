# Changelog

All notable changes to this project will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2024-XX-XX

### Added
- `setup.sh` generator supporting Cursor (`.mdc`), Claude Code (`CLAUDE.md`), Antigravity (`.agents/`), and AGENTS.md.
- Multi-tool selection: `--tool cursor,claude` or `--tool cursor --tool agents-md`.
- `--context` flag to generate `PROJECT_CONTEXT.md` from template.
- Skills with full agent instructions:
  - `developer.yaml` — polyglot developer with tech detection + rule loading workflow.
  - `tester.yaml` — polyglot tester with test writing principles.
- Rules with frontmatter (description + globs):
  - `go.md`, `bash.md`, `sql.md`, `yaml.md`, `typescript-react.md`, `frontend-vanilla.md`, `xml.md`.
- Project context template (`00-project-context.md.template`).
- Documentation: README, CONTRIBUTING, ROADMAP, ARCHITECTURE.
