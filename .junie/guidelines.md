# Project Development Guidelines

Last verified: 2025-10-30 13:44 (local time)

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
- GitHub
  - Use the GitHub CLI (e.g. `gh issue list` etc.).  
  - Use markdown formatting for issues, comments etc.  
  - DO NOT escape newlines.
  - Include the following sections in the issue body:
    - Description
    - Steps to reproduce (if a bug)
    - Current Implementation
    - Proposed Change
    - Files to modify
    - Acceptance Criteria (include checkboxes)
    - Additional Notes (if any)

Notes
- The repo favors ESM and Vite’s bundler-mode TS settings; avoid CommonJS/`require`.
- React Fast Refresh rules are enforced by `eslint-plugin-react-refresh`; avoid patterns that break HMR.
- Vite env vars must be prefixed with `VITE_` to be exposed to client code.

### Styling
- Tailwind CSS v4 + DaisyUI are used for styling. Tailwind Preflight provides the CSS reset; do not add custom global resets.
- Global stylesheet is `src/index.css` and should only import Tailwind and the DaisyUI plugin:
  ```css
  @import "tailwindcss";
  @plugin "daisyui";
  ```
- Prefer Tailwind utilities and DaisyUI component classes (`btn`, `card`, `badge`, etc.) over bespoke CSS. Avoid new `.css` files; use `className` utilities in components.
- The legacy Vite starter styles were removed (`src/App.css`).

## Unit Testing

### Runner
- Uses Bun’s built‑in test runner (`bun:test`). No extra script is required; invoke `bun test`.

### Structure and co-location
- Co-locate each feature’s tests and a helper class next to the feature itself.
  - App layer should only assert composition (that child features exist), not child behavior.
  - Example layout:
    - `src/<module>.ts` (feature component)
    - `src/<module>.test.helper.ts` (`class <Module>Helper`: encapsulates render, queries, and user actions)
    - `src/<module>.test.tsx` (behavior‑oriented tests for module)

### Writing tests
- Import from Bun’s runner: `import { describe, it, expect } from 'bun:test'`.
- Use the helper class to keep tests concise and intention‑revealing.

### Coverage
- Run `bun test --coverage`.
- Goal is 100% statement/branch/function/line coverage across the repo. If we cannot meet 100%, please open an issue describing the gaps so we can agree on exclusions or additional tests.

## Component Testing

### Runner

- Use playwright test runner (`bun run pw:ct`)
- `import { expect, test } from '@playwright/experimental-ct-react'`

### Structure and co-location
- Co-locate each feature’s tests and a helper class next to the feature itself.
- App layer should only assert composition (that child features exist), not child behavior.
- Example layout:
  - `src/components/<component>/index.tsx` (feature component)
  - `src/components/<component>/index.ctspec.tsx` (behavior‑oriented tests for feature)
  - `src/components/<component>/index.ctspec.helper.tsx` (`class <Component>Helper`: encapsulates render, queries, and user actions)

### Writing component tests

- Create a helper class to provide domain-specific-language (DSL) semantics for the test.
- Create custom matchers (`/playwright/matchers`) to improve test semantics.
  Example:

```ts
import { test as baseTest, expect as baseExpect } from '@playwright/experimental-ct-react'
import { FeatureHelper } from "./index.ctspec.helper.tsx"
import { toHaveSomeValue } from "../../../playwright/matchers/toHaveSomeValue.tsx"

const test = baseTest.extend({
  fixture: async ({ mount }, provide) => {
    const fixture = await FeatureHelper.mount(mount)
    await provide(fixture)
  },
})

const expect = baseExpect.extend({
  toHaveSomeValue,
})

test.describe('<Feature>', () => {
  test('should do something', async ({ fixture }) => {
    await expect(fixture).toHaveSomeValue()
  })
})
```

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
 - Prefer Tailwind/DaisyUI utility classes; consult the DaisyUI docs when picking components, and keep markup semantic.

---
This document is intentionally project-specific. If you adjust the setup, append the exact commands and minimal configs here.
