# Project Development Guidelines

Last verified: 2025-10-30 11:45 (local time)

This repository is a React 19 + TypeScript + Vite 7 project managed with Bun. The guidance below documents the project-specific build, lint, and test setup, plus tips that help with day-to-day development and debugging.

## Build and Configuration

- Runtime and package manager: Bun 1.3 (enforced).
  - `package.json` contains `"packageManager": "bun@1.3.0"` and `"engines": { "bun": ">=1.3.0 <2" }`.
- Dev server: Vite with `@vitejs/plugin-react`.
- TypeScript: composite setup with project references.
- ESM only: `package.json` has `"type": "module"`.

Key files and settings:
- `package.json` scripts
  - `dev`: `bunx vite`
  - `build`: `bunx tsc -b && vite build`
  - `preview`: `bunx vite preview`
  - `lint`: `bunx eslint .`
  - `test`: `bun test` (watch and coverage variants available)
- TypeScript
  - `tsconfig.json` references: `tsconfig.app.json`, `tsconfig.node.json`.
  - `tsconfig.app.json` (browser bundle):
    - `moduleResolution: bundler`, `noEmit: true`, `jsx: react-jsx`.
    - Strictness: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedSideEffectImports`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly`.
    - Includes only `src/`.
  - `tsconfig.node.json` (tooling/Node): same strictness, includes `vite.config.ts`.
- ESLint (`eslint.config.js`)
  - Extends: `@eslint/js` recommended, `typescript-eslint` recommended, `eslint-plugin-react-hooks` latest recommended, `eslint-plugin-react-refresh` Vite preset.
  - `globalIgnores(["dist"])` enabled.

### Typical workflows
- Install deps: `bun install`.
- Start dev server (HMR): `bun run dev`.
- Type check + production build: `bun run build`.
- Preview production build: `bun run preview`.
- Lint: `bunx eslint .`.
- Typecheck: `bunx tsc --noEmit`.

Notes
- The repo favors ESM and Vite’s bundler-mode TS settings; avoid CommonJS/`require`.
- React Fast Refresh rules are enforced by `eslint-plugin-react-refresh`; avoid patterns that break HMR.
- Vite env vars must be prefixed with `VITE_` to be exposed to client code.

## Testing

The project uses Bun’s built-in test runner and React Testing Library for component tests.

### How to run tests
- Run all tests: `bun test`
- Watch mode: `bun test --watch`
- Coverage (when bun is built with coverage): `bun test --coverage`

### DOM environment
- We use `happy-dom` to provide DOM APIs under Bun. It is registered automatically via `bunfig.toml` → `[test].preload = ["./test/setup.ts"]`.
- No Jest/Vitest dependency is required; we use Bun’s runner with RTL.

### Test locations, naming, and helpers
- Co-locate tests and their helper classes next to the feature module.
  - App tests should assert composition (children exist) and top-level layout only; feature behavior lives in feature tests.
  - Example layout:
    - `src/App.tsx` — app shell
    - `src/App.test.helper.tsx` — `AppHelper` with only the queries App tests need
    - `src/App.test.tsx` — checks the title/docs note and that `Counter` is present
    - `src/features/counter/Counter.tsx` — feature component
    - `src/features/counter/Counter.test.helper.tsx` — `CounterHelper` encapsulating render, queries, and user actions
    - `src/features/counter/Counter.test.tsx` — behavior tests (e.g., incrementing)
- Supported suffixes: `.test.ts`, `.spec.ts`, and TSX variants.
- Use `import { describe, it, expect } from 'bun:test'` in tests.

### Coverage target
- Aim for 100% coverage across statements/branches/functions/lines.
- If 100% cannot be reached (e.g., external integrations), open an issue with details so we can decide on exclusions or add tests.

## Additional Development Information

- Code style and linting
  - Follow rules from `eslint.config.js`.
  - Hooks: `eslint-plugin-react-hooks` is active with latest recommended config; respect dependency arrays and rules-of-hooks.
  - If you want type-aware linting, adopt the guidance in `README.md` to switch to `typescript-eslint`’s `recommendedTypeChecked`/`strictTypeChecked` configs and set `parserOptions.project` to `['./tsconfig.node.json', './tsconfig.app.json']`.
- TypeScript patterns
  - Use explicit exports and `verbatimModuleSyntax: true`; avoid default-import fallbacks for CJS modules.
  - Because `moduleResolution: bundler` is used, prefer fully-specified ESM imports and avoid `require`.
- Vite/React specifics
  - `@vitejs/plugin-react` is enabled; keep components and hooks pure to benefit from Fast Refresh.
  - Client entry is `src/main.tsx`; root DOM id is `#root` (see `index.html`).

## Troubleshooting
- JSX/TS types not found
  - Ensure `types: ["vite/client"]` is present (it is in `tsconfig.app.json`).
- Node-style imports fail
  - Use ESM syntax and ensure paths/file extensions are resolvable under `moduleResolution: bundler`.
- HMR not updating
  - Check for side-effectful module top-level code; verify React Refresh ESLint rules aren’t violated.
- DOM-related test failures
  - Ensure `bunfig.toml` exists and `test/setup.ts` registers `@happy-dom/global-registrator`.
- Sourcemaps/stack traces oddities in tests
  - If required, keep tests pure and avoid browser-only APIs; `happy-dom` covers most basics.

## Conventions
- Keep components small and stateless where possible.
- Co-locate tests and their helpers with features; use `tests/` only for larger integration suites.
- Avoid adding global ambient types in `src/`.

---
This document is intentionally project-specific. If you adjust the setup, append the exact commands and minimal configs here.
