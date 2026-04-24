---
description: "TypeScript and React coding standards"
globs: "*.ts, *.tsx, *.jsx"
---

# TypeScript & React — Coding Standards

## TypeScript Config
- Enable **strict mode** (`"strict": true` in `tsconfig.json`).
- Never use `any` — use `unknown`, generics, or proper type narrowing.
- Prefer `interface` over `type` for object shapes (interfaces are extendable).

## Component Patterns
- Use **functional components** with arrow functions.
- Define **interfaces for all props** — name them `{Component}Props`:
  ```tsx
  interface UserCardProps {
    user: User;
    onSelect: (id: string) => void;
  }
  ```
- Keep components focused: one component = one responsibility.
- Extract logic into custom hooks when a component grows beyond ~100 lines.

## Hooks
- Follow the **Rules of Hooks**: only call at the top level, only in React functions.
- Prefix custom hooks with `use` (e.g., `useAuth`, `useFetchUser`).
- Always specify dependency arrays for `useEffect`, `useMemo`, `useCallback`.

## Data Fetching
- Use **React Query** (TanStack Query) for server state management.
- Separate server state (React Query) from client state (useState, Zustand).
- Never fetch data inside `useEffect` directly — use a query hook.

## Validation
- Use **Zod** for runtime validation of API responses, form inputs, and env vars.
- Colocate Zod schemas with their types:
  ```ts
  const UserSchema = z.object({ id: z.string(), name: z.string() });
  type User = z.infer<typeof UserSchema>;
  ```

## Testing
- Use **Vitest** for unit tests and **Testing Library** for component tests.
- Test behavior, not implementation details.
- Prefer `getByRole`, `getByLabelText` over `getByTestId`.
- Mock external modules at the boundary — not internal functions.

## Naming
- Components: `PascalCase` (`UserCard`, `NavBar`).
- Hooks, functions, variables: `camelCase`.
- Constants: `UPPER_SNAKE_CASE`.
- Files: match the default export name (`UserCard.tsx`).

## Styling
- Prefer CSS Modules or styled-components over global CSS.
- Use CSS custom properties (`--color-primary`) for theming.
