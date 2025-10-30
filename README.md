# React Component Library

This is a React 19 + TypeScript + Vite 7 project managed with Bun. The repo is configured to use Bun 1.3 as the runtime and package manager, Bun’s built‑in test runner for unit tests, and React Testing Library for focused component tests.

Last updated: 2025-10-30 11:45 (local time)

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

## Testing

### Runner
- Uses Bun’s built‑in test runner (`bun:test`). No extra script is required; invoke `bun test`.

### DOM support for component tests
- We use `happy-dom` to provide a lightweight DOM under Bun. It’s registered automatically via `bunfig.toml` and `test/setup.ts`.
- Library used for components: `@testing-library/react`.

### Structure and co-location
- Co-locate each feature’s tests and a tiny helper class next to the feature itself.
  - App layer should only assert composition (that child features exist), not child behavior.
  - Example layout:
    - `src/App.tsx` (app shell)
    - `src/App.test.helper.tsx` (`AppHelper`: render + semantic queries used by App tests)
    - `src/App.test.tsx` (checks title/docs note and that `Counter` is present)
    - `src/components/counter/index.tsx` (feature component)
    - `src/components/counter/test.helper.tsx` (`CounterHelper`: encapsulates render, queries, and user actions)
    - `src/components/counter/test.tsx` (behavior‑oriented tests for counter increment)

### Writing tests
- Import from Bun’s runner: `import { describe, it, expect } from 'bun:test'`.
- Use the helper class to keep tests concise and intention‑revealing.
- Example:

```ts
import { describe, it, expect } from 'bun:test'
import { afterEach } from 'node:test'
import { AppHelper } from './App.test.helper.tsx'

describe('App', () => {
  let app: AppHelper

  afterEach(() => {
    app?.unmount()
  })

  it('increments count on click', async () => {
    app = new AppHelper()
    expect(app.counter.textContent).toContain('count is 0')
    await app.increment()
    expect(app.counter.textContent).toContain('count is 1')
  })
})
```

### Coverage
- Run `bun test --coverage`.
- Goal is 100% statement/branch/function/line coverage across the repo. If we cannot meet 100%, please open an issue describing the gaps so we can agree on exclusions or additional tests.

## Conventions
- Keep components small and pure to benefit from Vite React Fast Refresh.
- Co-locate tests and their helpers next to their feature modules.
- Avoid global ambient types in `src/`.

## Troubleshooting
- If `bun test` errors about missing DOM APIs, ensure `bunfig.toml` exists and `happy-dom` is installed, then re‑run `bun install`.
- If coverage isn’t reported, ensure your Bun build supports coverage and run with `--coverage`.
