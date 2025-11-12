import { render, screen } from "@testing-library/react"
import { ProjectsProvider } from "./projectsProvider.tsx"
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
  static renderWithProvider(fetchImpl: typeof fetch) {
    return render(
      <ProjectsProvider fetchImpl={fetchImpl}>
        <ProjectsStateProbe />
      </ProjectsProvider>
    )
  }

  static get state() {
    return screen.getByTestId("state")
  }
}
