### Homepage Cost Chart – Specification

#### 1. Purpose & Placement
- Visualize how total **cost** evolves over time across all projects.
- Route: `/` (homepage), above `ProjectTableView`.
- Wrapped inside existing `ProjectsProvider` so projects are available.
- Layout: full width; responsive height (target ≈ 200px on common laptop screens).
  - Suggested container sizing: `min-height: ~160px`, `max-height: ~40vh`; Recharts manages inner SVG.

#### 2. Data Model & Source
- Underlying entity: `Issue` (`src/schemas/issue.ts`). Relevant fields:
  - `timestamp: Date` (after schema transform).
  - `cost: number`.
  - `project: string` (project identifier).
- Time axis: `issue.timestamp`.
- Cost: `issue.cost` in currency units (opaque number; chart just sums).

**Included issues**
- All issues for all projects that appear on the homepage table:
  1. Projects loaded via `/api/projects` (handled by `ProjectsProvider`).
  2. For each project id, fetch `/api/projects/:projectId/issues`.
  3. Parse with `IssueSchema` and aggregate in-memory.
- Each issue contributes to exactly one project’s series.

**Time range**
- `minTimestamp`: earliest `issue.timestamp` across all issues.
- `maxTimestamp`: latest `issue.timestamp` across all issues.
- Chart covers full span `[minTimestamp, maxTimestamp]`.
- If there are no issues: show "no data" state; do not render buckets.

#### 3. Bucket Strategy (X-axis)

**Units**
- Allowed bucket units: **hours, days, weeks, months** (whole units only).
- Goal: ≈ 12 buckets with visually usable bar widths.

**Bucket selection algorithm (conceptual)**
1. Compute `spanMs = maxTimestamp - minTimestamp`.
2. Candidate bucket counts:
   - `hours = ceil(spanMs / 1h)`
   - `days = ceil(spanMs / 1d)`
   - `weeks = ceil(spanMs / 1w)`
   - `months = calendarMonthDiffInclusive(minTimestamp, maxTimestamp)`
3. Iterate units `[hour, day, week, month]` and pick the **finest** unit where:
   - `bucketCount <= 12`, and
   - `bucketCount >= 4` (to avoid trivial charts where possible).
4. If all units have `bucketCount > 12`:
   - Use the **coarsest** (months) and either:
     - accept more than 12 buckets, or
     - merge trailing buckets down to 12 (implementation detail).
5. If even `hours < 4`:
   - Use hours (1–3 buckets acceptable for very short spans).

**Bucket boundaries**
- Buckets are aligned to local wall-clock boundaries:
  - Hours: floor `minTimestamp` to hour start; bucket `[start, start+1h)`.
  - Days: floor to local midnight; bucket `[start, start+1d)`.
  - Weeks: floor to chosen week start (e.g. Monday 00:00); bucket `[start, start+7d)`.
  - Months: floor to first day of month (00:00); bucket ends at first day of next month.
- Final bucket `end` must be `>= maxTimestamp`.

**Aggregation**
- For each bucket `[start, end)` and each issue:
  - If `start <= issue.timestamp < end`:
    - `pid = issue.project`.
    - `bucket.perProject[pid] += issue.cost`.
- Per bucket values:
  - `start: Date`
  - `end: Date`
  - `perProject: Record<ProjectId, number>`
  - `totalCost = sum(perProject[pid])`.

#### 4. Series, Legend, Navigation

**Series structure**
- Chart type: **stacked bar chart**.
  - X-axis: buckets.
  - Y-axis: cost.
  - One bar per bucket; each bar is a stack of per-project segments.

**Navigation behavior**
- Chart is **informational only**:
  - Clicking bars/buckets/segments does **not** filter or navigate the project table.
  - No routing changes from the chart.
- Only interactive behavior with effects: legend toggles show/hide projects.

**Legend**
- Placement: right side of chart (vertical list) on md+; may stack below on small screens.
- Entry content:
  - Color swatch (matching series color in Recharts).
  - Project display name.
  - Optional: total cost across full range.

**Legend selection behavior**
- Compute `projectTotals[projectId]` = sum of cost for that project over all buckets.
- Default state:
  - Sort projects by `projectTotals` desc.
  - Top 5 projects: **selected** (visible).
  - Remaining projects: **deselected** by default but listed.
- Toggling:
  - Click legend entry → toggles that project’s visibility in all buckets.
  - Deselected projects are omitted from stacks; bars recompute visually.

**Legend persistence**
- Persist selection in `localStorage` under key like `homepageCostChart.legendSelection`.
- On mount:
  - Try to load selection.
  - Validate against current project IDs; if invalid/stale, recompute default (top 5).

#### 5. Visual Design & Colors

**Colors (Recharts palette)**
- Use **Recharts’ native color palette** for series, not DaisyUI/Tailwind colors.
- Implementation pattern:
  - Define `const rechartsPalette = ["#8884d8", "#82ca9d", ...]` or rely on Recharts defaults.
  - Build sorted project ID list.
  - Map `projectId -> rechartsPalette[index % palette.length]`.
  - Keep mapping stable between renders (deterministic order).

**Layout & responsiveness**
- Outer container: e.g. `w-full flex flex-col md:flex-row gap-4`.
- Chart area: flex item containing `ResponsiveContainer` + `BarChart`.
- Legend area: flex item with fixed or min width.
- Height:
  - Parent container sized via CSS/Tailwind (`min-h`, `max-h`),
  - `ResponsiveContainer` gets `width="100%" height="100%"` and fills available height.

#### 6. States & Feedback

**Loading**
- While fetching/aggregating issues:
  - Show skeleton placeholder in chart area (e.g. rounded rect with shimmer suggesting bars/axes).
  - Legend area shows skeleton rows.
  - Do not mount Recharts chart until data is ready.

**No data**
- If fetches succeed but there are no issues:
  - Fixed-height container with centered message: `"No cost data yet"`.
  - Optionally a minimal grid; no bars.

**Error**
- If aggregation cannot proceed (e.g. fatal fetch/parse error):
  - Show error message: `"Unable to load cost chart"` plus optional retry.
  - Behavior independent of, but stylistically consistent with, project table error UI.

#### 7. Interactions, Tooltips, Accessibility

**Tooltips**
- Use Recharts `Tooltip` with custom renderer.
- On hover over a segment/bucket, show:
  - Bucket time label / range:
    - Hours: `HH:mm` or `HH:mm–HH:mm`.
    - Days: `YYYY-MM-DD`.
    - Weeks: `YYYY-MM-DD – YYYY-MM-DD` (week start/end).
    - Months: e.g. `Nov 2025`.
  - Project name.
  - Segment cost for that project in the bucket.
  - Total bucket cost across all projects.

**Accessibility**
- Wrap chart in a region with accessible label, e.g. `aria-label="Cost over time per project"`.
- Legend entries implemented as buttons with `aria-pressed={isSelected}`.
- Provide keyboard access to legend toggles.

#### 8. Implementation Shape (Recharts + Hooks)

**Aggregation hook / utility**
- Example types:
```ts
interface CostBucket {
  start: Date
  end: Date
  totalCost: number
  perProject: Record<string, number>
}

interface UseCostBucketsResult {
  buckets: CostBucket[]
  projectTotals: Record<string, number>
  isLoading: boolean
  error?: string
}
```

- Responsibilities:
  - For each project (from `useProjects`), fetch issues and parse.
  - Determine `minTimestamp`, `maxTimestamp`, choose bucket unit, and compute buckets.
  - Return `buckets`, `projectTotals`, and state flags.

**Recharts data transformation**
- Transform `CostBucket[]` into Recharts data:
```ts
interface RechartsBucketDatum {
  bucketKey: string // x-axis label
  start: Date
  end: Date
  [projectId: string]: number | string | Date
}
```
- For each bucket:
  - `bucketKey` derived from unit and `start`/`end`.
  - `datum[projectId] = perProject[projectId] ?? 0` for each known project.

**`CostChart` component (presentation)**
- Props (example):
```ts
interface CostChartProps {
  buckets: CostBucket[]
  projectTotals: Record<string, number>
  projectsMeta: Record<string, { name: string }>
}
```
- Responsibilities:
  - Compute `RechartsBucketDatum[]` from `buckets`.
  - Determine ordered project list and map each to a color from the Recharts palette.
  - Manage legend state + `localStorage` persistence.
  - Render:
    - `ResponsiveContainer` → `BarChart` with `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`.
    - For each **visible** project id, render a `Bar` with `stackId="cost"` and its assigned color.
  - Render a custom legend UI in a separate column.

**Homepage integration (high level)**
- In homepage view:
  1. Use `useProjects()` to get `projects` & state.
  2. Pass project identifiers to aggregation hook to get `buckets`, `projectTotals`, `chartIsLoading`, `chartError`.
  3. Build `projectsMeta` from `projects` (id → name).
  4. Render chart section above `ProjectTableView`:
     - Loading → skeleton.
     - Error → error message.
     - No buckets → "no data".
     - Otherwise → `<CostChart buckets={buckets} projectTotals={projectTotals} projectsMeta={projectsMeta} />`.
