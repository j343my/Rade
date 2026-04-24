---
description: "Go coding standards"
globs: "*.go"
---

# Go — Coding Standards

## Error Handling
- **Always wrap errors** with `fmt.Errorf("context: %w", err)` for stack traceability.
- Never silently ignore errors — check every return value.
- Do **not** use `panic` outside of `main()` or `init()`.
- Prefer returning `error` over logging and continuing.

## Function Signatures
- Pass `context.Context` as the **first parameter** in any function that does I/O or may be long-running.
- Keep function parameter lists short (≤ 5 params); use an options struct for more.

## Interfaces
- Define interfaces **on the consumer side**, not the producer side.
- Keep interfaces small (1–3 methods). Prefer composition over large interfaces.

## Dependencies & Stdlib
- **No CGO** unless absolutely unavoidable (document why in a comment).
- Use `log/slog` (stdlib, Go 1.21+) for structured logging — avoid third-party loggers.
- Prefer stdlib packages over external dependencies when equivalent.

## Struct Tags
- Always add **explicit** `json:"field_name"` and `yaml:"field_name"` tags on exported struct fields.
- Use `omitempty` where appropriate.

## Naming
- Exported identifiers: `PascalCase`.
- Internal identifiers: `camelCase`.
- Acronyms stay uppercased: `HTTPClient`, `userID`.

## Formatting & Tooling
- All code must pass `gofmt` (or `goimports`).
- Run `go vet` and `staticcheck` in CI.

## Testing
- Use **table-driven tests** with `t.Run()` for sub-tests.
- Minimum **70% code coverage** on new code.
- Use `t.TempDir()` for file operations — never write to real paths.
- Test both happy path and error cases.
- Use `testify` only if already in the project; otherwise prefer stdlib `testing`.

## Documentation
- All exported functions, types, and constants must have doc comments.
- Comments start with the identifier name: `// FetchUser retrieves a user by ID.`
