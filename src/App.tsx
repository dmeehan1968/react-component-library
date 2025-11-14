import * as React from "react"
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { IssuesView } from './components/issues'
import { NotFoundView } from "./components/NotFoundView.tsx"
import { ProjectTableView } from './components/project-table'
import { ProjectsProvider } from './providers/projectsProvider.tsx'
import { Breadcrumbs } from './components/breadcrumbs'
import { useProjects } from './hooks/useProjects.tsx'
import { useCostBuckets } from './hooks/useCostBuckets.ts'
import { CostChart } from './components/cost-chart'

function App() {
  return (
    <BrowserRouter>
      <ProjectsProvider>
        <div className="min-h-screen flex flex-col gap-6 p-6 bg-base-100 text-base-content">
          <Breadcrumbs />
          <div className="w-full flex flex-col gap-6">
            <Routes>
              <Route path="/" element={<HomepageView />} />
              <Route path="/projects/:projectId/issues" element={<IssuesView/>}/>
              <Route path="*" element={<NotFoundView/>}/>
            </Routes>
          </div>
        </div>
      </ProjectsProvider>
    </BrowserRouter>
  )
}

const HomepageView: React.FC = () => {
  const { projects, isLoading } = useProjects()

  const projectIds = React.useMemo(
    () => (projects ?? []).map((p) => {
      const segments = p.url.split('/').filter(Boolean)
      if (segments.length >= 2 && segments[segments.length - 1] === 'issues') {
        return segments[segments.length - 2]
      }
      return segments[segments.length - 1] ?? p.name
    }),
    [projects],
  )

  const { buckets, projectTotals, isLoading: chartLoading, error: chartError } = useCostBuckets(projectIds)

  const projectsMeta = React.useMemo(() => {
    const meta: Record<string, { name: string }> = {}
    for (const p of projects ?? []) {
      const segments = p.url.split('/').filter(Boolean)
      let id: string
      if (segments.length >= 2 && segments[segments.length - 1] === 'issues') {
        id = segments[segments.length - 2]
      } else {
        id = segments[segments.length - 1] ?? p.name
      }
      meta[id] = { name: p.name }
    }
    return meta
  }, [projects])

  const showChartSkeleton = isLoading || chartLoading
  const showChartError = !!chartError
  const hasBuckets = buckets.length > 0

  return (
    <>
      <div className="w-full min-h-[160px] max-h-[40vh]">
        {showChartSkeleton && (
          <div className="w-full h-full animate-pulse flex flex-col md:flex-row gap-4" data-testid="cost-chart-skeleton">
            <div className="flex-1 bg-base-200 rounded" />
            <div className="md:w-64 w-full flex-shrink-0 space-y-2">
              <div className="h-4 bg-base-200 rounded" />
              <div className="h-4 bg-base-200 rounded" />
              <div className="h-4 bg-base-200 rounded" />
            </div>
          </div>
        )}
        {!showChartSkeleton && showChartError && (
          <div className="w-full min-h-[160px] flex items-center justify-center" data-testid="cost-chart-error">
            <p className="text-sm text-error">Unable to load cost chart</p>
          </div>
        )}
        {!showChartSkeleton && !showChartError && hasBuckets && (
          <CostChart buckets={buckets} projectTotals={projectTotals} projectsMeta={projectsMeta} />
        )}
        {!showChartSkeleton && !showChartError && !hasBuckets && (
          <div className="w-full min-h-[160px] flex items-center justify-center" data-testid="cost-chart-no-data">
            <p className="text-sm opacity-70">No cost data yet</p>
          </div>
        )}
      </div>
      <ProjectTableView />
    </>
  )
}

export default App
