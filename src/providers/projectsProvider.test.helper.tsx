import { render, screen, within } from "@testing-library/react"
import { type FetchImpl, ProjectsProvider } from "./projectsProvider.tsx"
import { useProjects } from "../hooks/useProjects.tsx"

// A small test consumer that renders the context state in the DOM so tests can assert easily
function ProjectsStateProbe() {
  const ctx = useProjects()

  if ("isLoading" in ctx) {
    return <div data-testid="state">loading:{String(ctx.isLoading)}</div>
  }
  if ("error" in ctx) {
    return <div data-testid="state">error:{ctx.error}</div>
  }
  return (
    <div data-testid="state">projects:{JSON.stringify(ctx.projects)}</div>
  )
}

export class ProjectsProviderHelper {
  private static lastRender: ReturnType<typeof render> | null = null

  static renderWithProvider(fetchImpl: FetchImpl) {
    this.lastRender = render(
      <ProjectsProvider fetchImpl={fetchImpl}>
        <ProjectsStateProbe />
      </ProjectsProvider>
    )
    return this.lastRender
  }

  static get state() {
    // Prefer container-scoped query to avoid collisions with prior renders
    if (this.lastRender) {
      return within(this.lastRender.container).getByTestId("state")
    }
    // Fallback to global in case tests render outside helper
    return screen.getByTestId("state")
  }
}
