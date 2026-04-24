---
description: "SQL coding standards"
globs: "*.sql"
---

# SQL — Coding Standards

## Migrations
- Use **numbered prefixes**: `001_create_users.sql`, `002_add_email_index.sql`.
- Each migration must have an `UP` and `DOWN` (or rollback) section.
- Never modify an existing migration — create a new one.

## Schema Design
- **Foreign keys** must be explicit with `REFERENCES` and `ON DELETE` / `ON UPDATE` actions.
- **Indexes** must be documented with a comment explaining their purpose.
- Use `NOT NULL` by default; allow `NULL` only when there is a clear business reason.

## Queries
- **Never use `SELECT *`** — list columns explicitly.
- Use **parameterized queries** (`$1`, `?`, `:name`) to prevent SQL injection.
- Use `EXPLAIN` (or `EXPLAIN ANALYZE`) to validate query performance before committing.

## Transactions
- Wrap multi-statement operations in **explicit transactions** (`BEGIN` / `COMMIT` / `ROLLBACK`).
- Keep transactions short — avoid holding locks longer than necessary.

## Naming
- Tables: `snake_case`, plural (`users`, `order_items`).
- Columns: `snake_case`, singular (`email`, `created_at`).
- Indexes: `idx_<table>_<column(s)>` (e.g., `idx_users_email`).
- Foreign keys: `fk_<table>_<ref_table>`.

## Style
- Use **UPPERCASE** for SQL keywords (`SELECT`, `FROM`, `WHERE`, `JOIN`).
- One clause per line for readability.
- Indent sub-queries and `JOIN` conditions.

## Data Integrity
- Always use appropriate column types (don't store dates as strings).
- Use `CHECK` constraints for business rules enforceable at the DB level.
- Prefer `UUID` or `BIGINT` for primary keys over `SERIAL` / `INT`.
