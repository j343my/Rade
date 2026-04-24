---
description: "Bash scripting standards"
globs: "*.sh"
---

# Bash — Scripting Standards

## Header
- Every script **must** start with:
  ```bash
  #!/usr/bin/env bash
  set -euo pipefail
  ```
- `-e`: exit on error. `-u`: treat unset variables as errors. `-o pipefail`: catch pipe failures.

## ShellCheck
- All scripts must be **shellcheck-clean** (`shellcheck script.sh` with zero warnings).
- Use `# shellcheck disable=SC2xxx` only with a justifying comment.

## Conditionals
- Always use `[[ ... ]]` (bash built-in), **never** `[ ... ]` (POSIX `test`).
- Prefer `if [[ -f "$file" ]]` over `test -f "$file"`.

## Variables
- **Quote all variables**: `"$VAR"`, `"${ARRAY[@]}"`.
- Use `local` inside functions to avoid polluting the global scope.
- Use `readonly` for constants.
- Prefer `${var:-default}` for defaults instead of conditional checks.

## Error Handling & Cleanup
- Set a `trap` for cleanup on `ERR`, `EXIT`, or `INT`:
  ```bash
  cleanup() { rm -rf "$TMP_DIR"; }
  trap cleanup EXIT
  ```
- Never leave temporary files behind.

## Structure
- Use **functions** instead of monolithic scripts. Each function does one thing.
- Main logic should be in a `main()` function called at the bottom.
- Keep functions under 50 lines when possible.

## Logging
- Use stderr for informational/error messages (`echo "..." >&2`).
- Use stdout only for program output (so scripts are pipeable).

## Portability
- Target Bash 4+ features (`associative arrays`, `mapfile`, etc.) only when documented.
- Avoid OS-specific commands without a guard (e.g., `if command -v gdate >/dev/null; then ...`).
