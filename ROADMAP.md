# Roadmap

Our vision: the universal standard for AI agent conventions.

## v1.0 — Core CLI ✅

- [x] `rade attach` — attach Rade to any project, generate all configs
- [x] `rade sync` — compare local rules with source, apply diff
- [x] `rade check` — read-only diff view
- [x] `rade update` — pull latest rules, regenerate configs
- [x] `rade import` — import rules from URL, GitHub repo, or local file
- [x] `rade detach` — cleanly remove Rade from a project
- [x] Multi-tool output: Cursor (`.mdc`), Claude Code (`CLAUDE.md`), Antigravity (`.agents/`), AGENTS.md
- [x] Skills: Developer (polyglot, tech detection) and Tester
- [x] Rules: Go, Bash, SQL, YAML, TypeScript/React, Frontend vanilla, XML
- [x] Project context template with `{{PROJECT_NAME}}` placeholders

## v1.1 — Ecosystem (planned)

- [ ] Windsurf support (`rade attach` generates `.windsurfrules`)
- [ ] `rade lint` — validate rule frontmatter and skill YAML
- [ ] More languages: Python, Rust, Terraform, Dockerfile
- [ ] `rade detach` backup option (tar.gz before removing)

## v1.2 — Import (planned)

- [ ] `rade import awesome-cursorrules` — bulk import from awesome-cursorrules
- [ ] `rade import --list` — browse available rules before importing
- [ ] Auto-deduplicate imported rules against existing ones

## v1.3 — Hub (planned)

- [ ] Rade Hub web UI — browse and search available rules
- [ ] Community registry for shared rules and skills
- [ ] `rade search <keyword>` CLI command

## v2.0 — Versioning (planned)

- [ ] Semantic versioning for individual rules
- [ ] Rule dependencies (`requires: [go.md]`)
- [ ] Override system — project-local patches on top of shared rules
- [ ] CI integration — auto-check rule drift on PR
