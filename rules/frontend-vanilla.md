---
description: "Frontend vanilla (HTML, JS, CSS) coding standards"
globs: "*.html, *.js, *.css"
---

# Frontend Vanilla — Coding Standards

## JavaScript
- Target **ES2020+** features (`optional chaining`, `nullish coalescing`, `Promise.allSettled`).
- Use `const` by default; `let` only when reassignment is needed. **Never** `var`.
- Use **Fetch API** for HTTP requests — no jQuery, no Axios unless explicitly approved.
- Prefer **Web Components** or simple module patterns over heavy frameworks.
- No build step required — code should run directly in modern browsers.

## HTML
- Use **semantic HTML5** elements: `<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<footer>`.
- Every `<img>` must have an `alt` attribute.
- Interactive elements need `aria-*` labels and keyboard support.
- Use a single `<h1>` per page; maintain proper heading hierarchy.
- All interactive elements must have unique `id` attributes.

## CSS
- Use **CSS custom properties** (`--color-primary`, `--spacing-md`) for theming and consistency.
- Prefer `rem` / `em` over `px` for sizing (except borders and shadows).
- Use **CSS Grid** and **Flexbox** for layout — no floats.
- Keep CSS in separate files — avoid inline styles.
- Use **mobile-first** responsive design with `min-width` media queries.
- No `!important` unless overriding third-party styles (document why).

## Modules & Dependencies
- Use **ES Modules** (`import` / `export`) in `<script type="module">`.
- No external CDN dependencies unless explicitly approved.
- No jQuery or legacy libraries.

## Performance
- Lazy-load images and heavy resources with `loading="lazy"`.
- Minimize DOM manipulation — batch updates.
- Use `requestAnimationFrame` for visual updates.

## Accessibility
- Ensure WCAG 2.1 AA compliance.
- Test keyboard navigation (Tab, Enter, Escape).
- Use `prefers-reduced-motion` for animations.
- Provide visible focus indicators.
