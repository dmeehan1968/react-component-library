### API routing docs (file-based)

Short ref for devs. See `spec_api-routing.md` for full details.

---

### 1. Where API routes live
- Root dir: `src/server/api` → URL prefix `/api`.
- Each **subdir = 1 path segment**.
  - Literal segment: `foo` → `/api/foo`.
  - Dynamic segment: `[id]` → `/api/:id`.
- Leaf file: `index.ts` inside last segment dir defines handlers for that path.

Examples:
- `src/server/api/items/index.ts` → `/api/items`.
- `src/server/api/items/[itemId]/index.ts` → `/api/items/:itemId`.

---

### 2. How to locate a handler
Given a URL path `/api/...`:
1. Drop `/api` prefix.
2. Split remaining path into segments.
3. Walk `src/server/api` matching segments to subdirs:
   - Exact name first (e.g. `items`).
   - If no exact match, check dynamic `[name]` dirs.
4. Open `index.ts` in the last matching dir.
5. Look for named exports by HTTP method (`GET`, `POST`, etc.).

If no `index.ts` or no matching method export exists, router returns 404/405.

---

### 3. Method handler shape
In any `index.ts` under `src/server/api/**`:

```ts
export type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  ctx: { params: Record<string, string>; query: URLSearchParams },
) => void | Promise<void>

export const GET: RouteHandler = (req, res, ctx) => { /* ... */ }
export const POST: RouteHandler = async (req, res, ctx) => { /* ... */ }
```

Notes:
- `ctx.params` holds values from dynamic segments:
  - Directory `[itemId]` → `ctx.params.itemId`.
- `ctx.query` is `URLSearchParams` parsed from `?key=value`.
- For large routes, method exports can delegate:
  - `export const GET = (req, res, ctx) => listItems(req, res, ctx)`.

Router behavior (summary):
- Chooses handler by `req.method.toUpperCase()`.
- `HEAD` → uses `HEAD` export if present, else `GET` without body.
- Unsupported method on existing path → 405 + `Allow` header.

---

### 4. Creating a new route (step-by-step)

Example: need `/api/users/:userId/settings` with `GET` + `PATCH`.

1. Under `src/server/api`, create folders for each segment:
   - `users/` (literal).
   - `[userId]/` (dynamic).
   - `settings/` (literal).
2. Inside `settings/`, add `index.ts`.
3. Implement handlers:

```ts
// src/server/api/users/[userId]/settings/index.ts
import type { RouteHandler } from '../../router' // or correct relative path

export const GET: RouteHandler = (req, res, ctx) => {
  const { userId } = ctx.params
  // read settings, respond JSON
}

export const PATCH: RouteHandler = async (req, res, ctx) => {
  const { userId } = ctx.params
  // read body from req, update settings, respond JSON
}
```

4. If needed, factor heavy logic into helpers imported by `index.ts`.
5. Add / update tests to hit `/api/users/:userId/settings` via fetch.

Router wiring:
- Router / Vite plugin should automatically see new route once `index.ts` is imported into the route registry (or discovered via glob, depending on implementation).

---

### 5. Tips & conventions
- Prefer small `index.ts` files; move non-routing logic to `*.service.ts` / `*.lib.ts` nearby.
- Keep URL structure and directory structure in sync; avoid “misc” folders.
- Use clear param names in brackets: `[projectId]`, `[userId]`, not `[id]` everywhere.
- Avoid touching `req.url` in handlers; use `ctx.params` + `ctx.query`.
