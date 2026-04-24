# Contributing to Rade

Thanks for contributing! This doc explains how to submit changes and add new rules.

---

## Submitting a PR

1. **Fork** the repo and create a branch from `main`:
   ```bash
   git checkout -b feat/add-rust-rules
   ```
2. Make your changes.
3. **Test locally** (see below).
4. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add rules/rust.md
   fix: correct Go naming convention
   docs: update supported tools table
   ```
5. **Push** and open a Pull Request against `main`.

## PR Checklist

- [ ] Markdown renders correctly
- [ ] YAML is valid (`yamllint skills/`)
- [ ] `npm test` passes
- [ ] `npm link && rade attach /tmp/test-project` runs without errors
- [ ] No broken links in docs
- [ ] `CHANGELOG.md` updated if user-facing

## Adding a Rule for a New Technology

1. Create `rules/<technology>.md`:
   ```markdown
   ---
   description: "Technology X coding standards"
   globs: "*.ext"
   ---
   # Technology X — Coding Standards

   ## Category
   - Rule 1
   - Rule 2
   ```

2. The frontmatter is **required**:
   - `description`: used by Cursor to decide when to apply the rule.
   - `globs`: file patterns that trigger the rule (e.g., `*.py`, `*.rs`).

3. No changes needed elsewhere — the generator reads globs/description from frontmatter automatically.

4. Update `README.md` — add your tech to the "Languages & Technologies Covered" table.

5. Open a PR.

## Adding or Editing a Skill

Skills live in `skills/*.yaml`. Key fields:
- `display_name` / `short_description`: metadata.
- `instructions`: the full agent prompt (extracted by the generator).
- `model` / `temperature` / `autonomy`: agent config hints.

Test your changes:
```bash
npm link
mkdir /tmp/test-project && cd /tmp/test-project
rade attach .
# inspect .cursor/rules/, AGENTS.md, CLAUDE.md
```

## Testing Locally

```bash
npm install
npm test            # run the test suite
npm link            # install rade globally from source
rade attach /tmp/test-project
```

## Code Style

- **ESM only** — `import`/`export`, no `require()`.
- **Pure JavaScript** — no TypeScript.
- **No comments** unless the why is non-obvious.
- **Error handling** at every I/O boundary.
- **English** for all user-facing messages and code comments.

## Questions?

Open an issue — we're happy to help!
