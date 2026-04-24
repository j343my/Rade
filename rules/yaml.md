---
description: "YAML formatting standards"
globs: "*.yaml, *.yml"
---

# YAML — Formatting Standards

## Indentation
- Use **2 spaces** — never tabs.
- Be consistent across all files in the project.

## Boolean Values
- Always use `true` / `false` — **never** `yes`, `no`, `on`, `off`, `y`, `n`.
- These ambiguous values cause subtle bugs across YAML parsers.

## Strings
- Quote strings that could be misinterpreted: `"null"`, `"true"`, `"3.14"`, `"2024-01-01"`.
- Prefer literal blocks (`|`) for multi-line strings.
- Use folded blocks (`>`) only when you explicitly want line-folding.

## DRY: Anchors & Aliases
- Use **anchors** (`&anchor`) and **aliases** (`*anchor`) to avoid repetition.
- Use `<<: *anchor` for merge keys to inherit common config.
- Document anchors with a comment explaining what they represent.

## Schema Validation
- Validate YAML files against a schema when available (JSON Schema, custom).
- Run `yamllint` in CI with a `.yamllint.yml` config:
  ```yaml
  rules:
    line-length:
      max: 120
    truthy:
      allowed-values: ['true', 'false']
  ```

## Keys
- Use `snake_case` for keys.
- Keep key names lowercase.
- Avoid deeply nested structures (max 4–5 levels).

## Encoding
- Use **UTF-8** encoding.
- Start documents with `---` when a file contains multiple documents.
