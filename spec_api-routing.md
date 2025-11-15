### API routing spec (file-based router)

#### Goals
- Make mock API routes predictable, discoverable, and easy to extend.
- Eliminate ad-hoc regex + `req.url` parsing from handlers.
- Centralize matching, params extraction, and method dispatch.

---

### 1. Directory → URL mapping

- Root: `src/server/api` represents the `/api` URL prefix.
- Each subdirectory under `src/server/api` is **one URL segment**.
  - Literal segment: `projects` → `projects`.
  - Dynamic segment: `[projectId]` → `:projectId`.
- A route file is named `index.ts` inside the last segment directory.
- The URL path for a given `index.ts` is:

  ```text
  /api
    + /<segment-from-each-parent-directory>
  ```

Examples:

- `src/server/api/projects/index.ts`
  - Path segments: `projects`
  - URL: `GET /api/projects` (plus other methods if exported).

- `src/server/api/projects/[projectId]/issues/index.ts`
  - Path segments: `projects`, `[projectId]`, `issues`
  - URL: `GET /api/projects/:projectId/issues`.

Notes / future extensions:
- We may later allow `.tsx` in addition to `.ts` for route files.
- We reserve `[...rest]` / `[...slug]` for potential catch-all segments, but do not need them yet.

---

### 2. Dynamic segments & params

- Directory names in square brackets define **named path params**:
  - `[projectId]` → `params.projectId`.
  - `[slug]` → `params.slug`.
- (Optional, future) A directory named `[...rest]` or `[...slug]` would act as a catch-all segment.

Router responsibilities:
- Convert bracket segments to regex at compile time.
- Apply `decodeURIComponent` to each param value.
- Expose params as a simple `Record<string, string>` via `RouteContext`.

```ts
export interface RouteContext {
  params: Record<string, string>
  query: URLSearchParams
}
```

Within handlers, consumers never touch `req.url` directly for path parsing; they use `ctx.params` and `ctx.query`.

---

### 3. Methods & handlers in route modules

Each `index.ts` under `src/server/api/**` may export **one or more HTTP verb handlers** as named exports.

Type shape:

```ts
import type { IncomingMessage, ServerResponse } from 'node:http'

export interface RouteContext {
  params: Record<string, string>
  query: URLSearchParams
}

export type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RouteContext,
) => void | Promise<void>
```

Conventions:
- Verb exports are **uppercase** and must match the HTTP method exactly:
  - `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`.
- A route file may omit methods it does not support.
- Complex routes can delegate to other modules from within the verb export.

Example (`/api/projects`):

```ts
// src/server/api/projects/index.ts
import type { RouteHandler } from '../router'
import { projectsData } from './projects.data'
import { issuesByProject } from '../issues/issues.data'

export const GET: RouteHandler = (_req, res, _ctx) => {
  // derive stats, enrich projects, respond JSON
}
```

Example (`/api/projects/:projectId/issues`):

```ts
// src/server/api/projects/[projectId]/issues/index.ts
import type { RouteHandler } from '../../../router'
import { issuesByProject } from '../../../issues/issues.data'

export const GET: RouteHandler = (_req, res, ctx) => {
  const { projectId } = ctx.params
  const data = issuesByProject[projectId] ?? []
  // respond JSON
}
```

Router behavior for methods:
- Normalize `req.method` to uppercase.
- If a matching export exists (e.g. `GET`), call it.
- For `HEAD` requests:
  - If a `HEAD` export exists, call it.
  - Else, if `GET` exists, call `GET` but omit the response body.
- If no export exists for the method:
  - Respond with `405 Method Not Allowed`.
  - Set `Allow` header to the list of supported methods for that path.

---

### 4. Router API sketch (no implementation yet)

New shared router module (conceptual):

```ts
// src/server/api/router.ts
import type { IncomingMessage, ServerResponse } from 'node:http'

export interface RouteContext {
  params: Record<string, string>
  query: URLSearchParams
}

export type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RouteContext,
) => void | Promise<void>

export interface CompiledRoute {
  pattern: string              // e.g. '/api/projects/:projectId/issues'
  match(pathname: string): RouteContext['params'] | null
  handlers: Partial<Record<string, RouteHandler>> // keyed by HTTP method
}

export interface ApiRouter {
  handle(req: IncomingMessage, res: ServerResponse): void | Promise<void>
}

export function createApiRouter(routes: CompiledRoute[]): ApiRouter {
  // - normalize req.url to pathname + query
  // - find first CompiledRoute whose match(pathname) returns params
  // - select handler based on req.method
  // - construct RouteContext and invoke handler
  // - handle 404/405/HEAD/OPTIONS defaults
}
```

Pattern compilation helper (conceptual):

```ts
// converts '/api/projects/[projectId]/issues' → regex + param names
export function compilePattern(pattern: string): (pathname: string) => Record<string, string> | null {
  // implementation detail; uses the bracket segments defined above
}
```

Route discovery:
- Router auto-builds its route table from the filesystem using Vite `import.meta.glob`.
- Glob pattern: `import.meta.glob('./**/index.ts', { eager: true })` inside a file under `src/server/api`.
- Each matched module is assumed to live under `src/server/api` and to export zero or more HTTP verb handlers.

Conceptual example (location not fixed yet, but typically `src/server/api/routes.ts`):

```ts
// src/server/api/routes.ts (conceptual)
import type { RouteHandler, CompiledRoute } from './router'

// Eagerly import all route modules; keys are virtual paths like './projects/index.ts'
const modules = import.meta.glob('./**/index.ts', { eager: true }) as Record<
  string,
  Partial<Record<string, RouteHandler>>
>

export const compiledRoutes: CompiledRoute[] = Object.entries(modules).map(
  ([path, handlers]) => {
    // Derive URL pattern from file system path:
    // - strip leading './'
    // - drop trailing '/index.ts'
    // - split remaining segments
    // - map `[param]` → `:param`
    // - prefix with '/api/'
    const pattern = filePathToPattern(path) // e.g. './projects/[id]/index.ts' → '/api/projects/:id'

    return {
      pattern,
      match: compilePattern(pattern),
      handlers,
    }
  },
)
```

Notes:
- `filePathToPattern` encapsulates the filesystem → URL mapping rules defined in this spec.
- Only `index.ts` files participate; no additional registration is required when adding a new route.
- Tests should assert that new `index.ts` files appear in `compiledRoutes` and are reachable via HTTP.

Integration with Vite plugin:
- Replace the current `ApiRoute[]` composition with a single router instance built from the globbed `compiledRoutes`:

  ```ts
  // src/server/api/index.ts (conceptual)
  import type { Plugin } from 'vite'
  import { createApiRouter } from './router'
  import { compiledRoutes } from './routes.generated' // or manual list

  const router = createApiRouter(compiledRoutes)

  export function apiPlugin(): Plugin {
    return {
      name: 'api-routes',
      configureServer(server) {
        server.middlewares.use('/api', (req, res, next) => {
          router.handle(req, res)
          if (!res.writableEnded) next?.()
        })
      },
      configurePreviewServer(server) {
        server.middlewares.use('/api', (req, res, next) => {
          router.handle(req, res)
          if (!res.writableEnded) next?.()
        })
      },
    }
  }
  ```

This keeps Vite integration thin while centralizing all routing logic.

---

### 5. Behavior guarantees (edge cases)

- **Trimmed vs full URL**:
  - Router is responsible for normalizing the path. It should handle cases where Vite middlewares have trimmed the prefix so handlers do not need to special-case this.

- **404 Not Found**:
  - If no route pattern matches the normalized pathname, respond with `404` and a simple text or JSON body.

- **405 Method Not Allowed**:
  - If the path matches but the HTTP method is unsupported, respond with `405` and set `Allow` header.

- **HEAD / OPTIONS**:
  - `HEAD`: use `HEAD` handler if present; otherwise fallback to `GET` sans body.
  - `OPTIONS`: either implement per-route `OPTIONS` or a default handler that lists allowed methods.

- **Query string**:
  - Parsed once into `URLSearchParams` and provided via `ctx.query`.
  - Handlers do not read `req.url` directly.

---

### 6. Migration notes (from current implementation)

1. Introduce `router.ts` with `RouteContext`, `RouteHandler`, and pattern compilation.
2. Add a glob-based route discovery module (e.g. `src/server/api/routes.ts`) that:
   - Uses `import.meta.glob('./**/index.ts', { eager: true })` to load all route modules under `src/server/api`.
   - Applies `filePathToPattern` to each file path to derive its URL pattern.
   - Builds `CompiledRoute[]` via `compilePattern(pattern)` and the verb-named exports (`GET`, `POST`, etc.) from each module.
3. Update `apiPlugin` to construct a single router instance with `createApiRouter(compiledRoutes)` and mount it at `/api` for both dev and preview, removing the old `ApiRoute[]` composition.
4. Move existing handler logic into file-based routes that follow this spec, for example:
   - `src/server/api/projects/index.ts` with `export const GET` for the collection endpoint.
   - `src/server/api/projects/[projectId]/issues/index.ts` with `export const GET` for the nested issues endpoint.
5. Delete legacy route wiring (`projectsRoute`, `issuesRoute`, and any direct `ApiRoute[]` usage) once tests and manual checks confirm the new router behaves correctly.
