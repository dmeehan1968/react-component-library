import { describe, it, expect, afterEach } from "bun:test"
import { screen, waitFor, render, cleanup } from "@testing-library/react"
import { type FetchImpl, ProjectsProvider } from "./projectsProvider.tsx"
import { ProjectsProviderHelper } from "./projectsProvider.test.helper.tsx"
import { useProjects } from "../hooks/useProjects.tsx"
import { deferred, okResponse, notOkResponse, createFetchMock } from "./testShared.ts"

describe("ProjectsProvider", () => {
  // Ensure we cleanup between tests since Bun doesn't auto-clean by default
  afterEach(() => {
    cleanup()
  })

  it("shows loading while fetching and then sets projects on success", async () => {
    const d = deferred<Response>()

    const fetchSpy = createFetchMock(() => d.promise)

    const { container } = ProjectsProviderHelper.renderWithProvider(fetchSpy)

    // Immediately after mount we should see loading:true
    expect(ProjectsProviderHelper.state.textContent).toBe("loading:true")

    // Resolve with a successful response
    const projects = [{ name: "A", url: "/a", lastUpdated: new Date().toISOString(), issueCount: 1 }]
    d.resolve(okResponse(projects))

    await waitFor(() => {
      expect(ProjectsProviderHelper.state.textContent).toBe(`projects:${JSON.stringify(projects)}`)
    })

    // loading should be false now and no residual nodes
    expect(container.textContent?.includes("loading:true")).toBe(false)
    expect(fetchSpy.mock.calls).toEqual([['/api/projects']])
  })

  it("leaves projects empty when response is not ok", async () => {
    const d = deferred<Response>()
    const fetchSpy = createFetchMock(() => d.promise)
    ProjectsProviderHelper.renderWithProvider(fetchSpy)

    // in-flight
    expect(ProjectsProviderHelper.state.textContent).toBe("loading:true")

    d.resolve(notOkResponse())

    await waitFor(() => {
      expect(ProjectsProviderHelper.state.textContent).toBe("projects:[]")
    })
  })

  it("sets error when fetch throws", async () => {
    const d = deferred<Response>()
    const fetchSpy = createFetchMock(() => d.promise)
    ProjectsProviderHelper.renderWithProvider(fetchSpy)

    // trigger rejection
    const err = new Error("network down")
    d.reject(err)

    await waitFor(() => {
      expect(ProjectsProviderHelper.state.textContent).toBe(`error:${err.message}`)
    })
  })

  it("re-fetches when fetchImpl reference changes", async () => {
    // first fetch resolves to []
    const d1 = deferred<Response>()
    const fetch1 = createFetchMock(() => d1.promise)

    function Probe() {
      const ctx = useProjects()
      if ("isLoading" in ctx) return <div data-testid="state">loading</div>
      if ("error" in ctx) return <div data-testid="state">error</div>
      return <div data-testid="state">projects:{ctx.projects.length}</div>
    }

    const r = render(
      <ProjectsProvider fetchImpl={fetch1}>
        <Probe />
      </ProjectsProvider>
    )

    d1.resolve(okResponse([]))
    await waitFor(() => {
      expect(screen.getByTestId('state').textContent).toBe('projects:0')
    })

    // Now rerender with a new fetch impl
    const d2 = deferred<Response>()
    const projects = [{ name: "B", url: "/b", lastUpdated: new Date().toISOString(), issueCount: 2 }]
    const fetch2 = createFetchMock(() => d2.promise)

    r.rerender(
      <ProjectsProvider fetchImpl={fetch2}>
        <Probe />
      </ProjectsProvider>
    )

    // Should enter loading again after fetchImpl changed
    expect(screen.getByTestId('state').textContent).toBe('loading')

    d2.resolve(okResponse(projects))
    await waitFor(() => {
      expect(screen.getByTestId('state').textContent).toBe('projects:1')
    })

    r.unmount()
  })
})
