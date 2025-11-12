Project: react-component-library — Guidelines (2025-11-12)

- Toolchain
  - Runtime: Bun ≥1.3.x only. `packageManager: bun@1.3.0`.
  - Dev server: Vite + React + Tailwind v4 plugin; custom `apiPlugin` mounts mock routes.

- Install / Build / Run
  - Install: `bun install`
  - Dev: `bun run dev` → Vite serves + mock API mounted
  - Build: `bun run build` (TS project refs, then Vite)
  - Preview: `bun run preview` (mock API mounted in preview too)

- Mock API (dev/preview)
  - Vite plugin `src/server/api/index.ts` mounts:
    - GET `/api/projects` → enriched list (adds `issueCount`, `lastUpdated` from issues dataset)
    - GET `/api/projects/:projectId/issues`
  - Paths supported in both trimmed and full forms (middleware may trim prefix); handlers guard by method.

- TypeScript config quirks (important)
  - Root `tsconfig.json` exists solely to satisfy Playwright CT transpilation; sets `jsx: react-jsx` + `allowImportingTsExtensions: true` to avoid TS6142/TS5097 in CT.
  - `tsconfig.app.json`: bundler resolution; strict; excludes `playwright/**` from app typecheck; includes `playwright-ct.config.ts` only for types.
  - `tsconfig.node.json`: tooling (vite config) types.

- Linting / Style
  - ESLint (flat) extends: `@eslint/js` recommended, `typescript-eslint` recommended, `react-hooks` latest, `react-refresh` vite; ignores `dist`.
  - TS strict on; `noUnused*`, `noUncheckedSideEffectImports`, `erasableSyntaxOnly` enabled.
  - Prefer functional React components; hooks follow rules-of-hooks; use `clsx` + Tailwind utility classes; `tailwind-merge` where needed (already a dep).

- Unit tests (Bun + happy-dom + Testing Library)
  - Run: `bun test` | watch: `bun run test:watch` | coverage: `bun run test:coverage`.
  - Env: Bun test runner with `happy-dom` (DOM API). No Jest.
  - Location: `src/**/*.test.ts(x)`.
  - Patterns/conventions:
    - Use `@testing-library/react` render/query; no enzyme.
    - Providers accept `fetchImpl` prop for DI; use `src/providers/testShared.ts` helpers:
      - `deferred<T>()` for controllable promises
      - `okResponse`, `notOkResponse`
      - `createFetchMock` (Bun `mock`) to stub fetch-like fns
    - Example: `IssuesProviderHelper` and `IssuesStateProbe` pattern to assert provider state via `data-testid`.

- Component tests (Playwright Component Testing)
  - Install once: `bun run pw:install` (downloads browsers).
  - Run all: `bun run pw:ct` | UI mode: `bun run pw:ct:ui`.
  - Run focussed test: `bun run pw:ct --grep <pattern>`
  - Config: `playwright-ct.config.ts`
    - `testDir: ./src`, `testMatch: **/*.ctspec.(ts|tsx)`
    - `use.ctTemplateDir: playwright/` (HTML template, global styles)
    - `use.ctViteConfig.plugins: [tailwindcss(), react()]` — CT runs with Tailwind + React plugins.
  - Helpers live next to components, e.g. `src/components/project-table/index.ctspec.helper.tsx` exposes a page-object style API for mounting via `fixtures.mount` and querying via `Locator`s.

- Component: Project Table (example-specific tips)
  - Sorting logic: `src/components/project-table/projectSort.tsx` (locale-aware by name; dates; stable, non-mutating). Unit-tested by `projectSort.test.ts`.
  - Test IDs centralized under `index.testids.ts` to keep selectors stable across TL and CT.

- Providers + Data Flow
  - `ProjectsProvider` fetches `/api/projects`, enriches view; exposes loading/error/data.
  - `IssuesProvider` fetches `/api/projects/:projectId/issues`.
  - Both re-fetch when `fetchImpl` identity changes (covered by tests). Use this to force refresh in-dev.

- Adding tests
  - Unit: colocate `*.test.tsx` near subject; prefer Testing Library queries; drive via public props/context; inject `fetchImpl` rather than mocking global `fetch`.
  - Component (CT): create a `*.ctspec.tsx`; if complex, add `*.ctspec.helper.tsx` with a small page-object to hide `mount`/router/context wiring (see project-table helper). Keep assertions via Playwright `Locator`s and `getByTestId`.

- Commands quick ref
  - `bun install`
  - `bun run dev` | `bun run build` | `bun run preview`
  - `bun test` | `bun run test:watch` | `bun run test:coverage`
  - `bun run pw:install` (once) → `bun run pw:ct` | `bun run pw:ct:ui`
  - `bun run lint`

- Troubleshooting
  - CT TS errors about JSX or `.tsx` imports → ensure root `tsconfig.json` is present (don’t delete) and `allowImportingTsExtensions: true` remains.
  - Missing browsers for Playwright → run `bun run pw:install`.
  - API 404s in dev/preview → check `apiPlugin` is included in `vite.config.ts` plugins and routes defined in `src/server/api/**`.
