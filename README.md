# React Component Library

This is a React 19 + TypeScript + Vite 7 project managed with Bun. The repo is configured to use Bun 1.3 as the runtime and package manager, Bun’s built‑in test runner for unit tests, and React Testing Library for focused component tests.

Last updated: 2025-10-30 13:44 (local time)

## Prerequisites
- Bun 1.3.x installed (`bun --version` should report 1.3.x)
- Node is not required to run scripts; the project is ESM‑only.

`package.json` enforces this via:
- `"packageManager": "bun@1.3.0"`
- `"engines": { "bun": ">=1.3.0 <2" }`

## Scripts
- Dev server (HMR): `bunx vite`
- Build (typecheck + bundle): `bunx tsc -b && vite build`
- Preview production build: `bunx vite preview`
- Lint: `bunx eslint .`
- Tests: `bun test` (watch: `bun test --watch`, coverage: `bun test --coverage`)

## Styling: Tailwind CSS + DaisyUI

- Tailwind CSS v4 and DaisyUI are installed and configured. We rely on Tailwind Preflight for the CSS reset and avoid custom global CSS.
- Global stylesheet: `src/index.css` contains only Tailwind/DaisyUI imports:

```css
@import "tailwindcss";
@plugin "daisyui";
```

- Use Tailwind utility classes and DaisyUI component classes (`btn`, `card`, `badge`, `navbar`, etc.) instead of writing bespoke CSS.
- Prefer semantic HTML plus utilities; co-locate any rare component‑scoped styles via inline `className` utilities rather than separate `.css` files.
- The previous Vite starter CSS (`App.css`) was removed.

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
import ctReact from '@playwright/experimental-ct-react'
import { FeatureHelper } from "./index.ctspec.helper.tsx"
import { toHaveSomeValue } from "../../../playwright/matchers/toHaveSomeValue.tsx"

const test = ctReact.test.extend({
  fixture: async ({ mount }, provide) => {
    const fixture = await FeatureHelper.mount(mount)
    await provide(fixture)
  },
})

const expect = ctReact.expect.extend({
  toHaveSomeValue,
})

test.describe('<Feature>', () => {
  test('should do something', async ({ fixture }) => {
    await expect(fixture).toHaveSomeValue()
  })
})
```

## Conventions
- Keep components small and pure to benefit from Vite React Fast Refresh.
- Co-locate tests and their helpers next to their feature modules.
- Avoid global ambient types in `src/`.
 - Prefer Tailwind/DaisyUI class utilities over custom CSS; when in doubt, consult https://daisyui.com/components/ for available components.

## Troubleshooting
- If `bun test` errors about missing DOM APIs, ensure `bunfig.toml` exists and `happy-dom` is installed, then re‑run `bun install`.
- If coverage isn’t reported, ensure your Bun build supports coverage and run with `--coverage`.
