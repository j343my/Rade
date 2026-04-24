# Contributing to Rade

Thanks for contributing! This doc explains how to submit changes and add new rules.

---

## Submitting a PR

1. **Fork** the repo and create a branch from `main`:
   ```bash
   git checkout -b feat/add-rust-rules
   ```
2. Make your changes.
3. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add rules/rust.md
   fix: correct Go naming convention
   docs: update supported tools table
   ```
4. **Push** and open a Pull Request against `main`.

## PR Structure

- **Clear title** (e.g., `feat: add rules/rust.md`).
- **Description**: what changed and why.
- **One concern per PR**. Don't mix unrelated changes.

## Validation Before Commit

- [ ] Markdown renders correctly (`npx markdownlint-cli .`)
- [ ] YAML is valid (`yamllint skills/`)
- [ ] `./setup.sh /tmp/test-project` runs without errors
- [ ] No broken links in docs
- [ ] `CHANGELOG.md` updated if user-facing

## Adding a Rule for a New Technology

1. Create `rules/<technology>.md`:
   ```markdown
   ---
   description: "Technology X coding standards"
   globs: "*.ext"
   ---
   # Technology X Coding Standards
   - Formatting and style rules
   - Naming conventions
   - Error handling patterns
   - Recommended tooling
   ```

2. The frontmatter is **required**:
   - `description`: used by Cursor to decide when to apply the rule.
   - `globs`: file patterns that trigger the rule (e.g., `*.py`, `*.rs`).

3. **No changes needed in `setup.sh`** — it reads globs/description from frontmatter automatically.

4. Update `README.md` — add your tech to the "Languages & Technologies Covered" table.

5. Open a PR.

## Adding or Editing a Skill

Skills live in `skills/*.yaml`. Key fields:
- `display_name` / `short_description`: metadata.
- `instructions`: the full agent prompt (extracted by `setup.sh`).

Test your changes: `./setup.sh /tmp/test --tool cursor` and inspect the generated `.mdc`.

## Questions?

Open an issue — we're happy to help!
