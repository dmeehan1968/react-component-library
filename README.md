# React Component Library

This is a React 19 + TypeScript + Vite 7 project managed with Bun. The repo is configured to use Bun 1.3 as the runtime and package manager, Bun’s built‑in test runner for unit tests, and React Testing Library for focused component tests.

Last updated: 2025-10-30 10:57 (local time)

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
- Co-locate each feature’s tests and a tiny DSL module with the feature itself.
  - Example (from this repo):
    - `src/App.tsx` (component)
    - `src/App.test.dsl.tsx` (helpers to render and query the component)
    - `src/App.test.tsx` (the readable, behavior‑oriented tests)

### Writing tests
- Import from Bun’s runner: `import { describe, it, expect } from 'bun:test'`.
- Use the DSL to keep tests concise and intention‑revealing.
- Example:

```ts
import { describe, it, expect } from 'bun:test'
import userEvent from '@testing-library/user-event'
import { renderApp } from './App.test.dsl'

describe('App', () => {
  it('increments count on click', async () => {
    const { get } = renderApp()
    const btn = get.countButton()
    expect(btn.textContent).toContain('count is 0')
    await userEvent.click(btn)
    expect(btn.textContent).toContain('count is 1')
  })
})
```

### Coverage
- Run `bun test --coverage`.
- Goal is 100% statement/branch/function/line coverage across the repo. If we cannot meet 100%, please open an issue describing the gaps so we can agree on exclusions or additional tests.

## Conventions
- Keep components small and pure to benefit from Vite React Fast Refresh.
- Co-locate tests and DSLs next to their feature modules.
- Avoid global ambient types in `src/`.

## Troubleshooting
- If `bun test` errors about missing DOM APIs, ensure `bunfig.toml` exists and `happy-dom` is installed, then re‑run `bun install`.
- If coverage isn’t reported, ensure your Bun build supports coverage and run with `--coverage`.
