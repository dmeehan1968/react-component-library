import { describe, it, expect } from "bun:test"
import { screen, waitFor, render } from "@testing-library/react"
import { ProjectsProvider } from "./projectsProvider.tsx"
import { ProjectsProviderHelper } from "./projectsProvider.test.helper.tsx"
import { useProjects } from "../hooks/useProjects.tsx"

function deferred<T>() {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function okResponse(data: unknown) {
  return {
    ok: true,
    json: async () => data,
  } as Response
}

function notOkResponse() {
  return {
    ok: false,
    json: async () => ({}),
  } as Response
}

describe("<ProjectsProvider>", () => {
  it("shows loading while fetching and then sets projects on success", async () => {
    const d = deferred<Response>()
    const calls: unknown[] = []
    const fetchSpy = ((...args: unknown[]) => {
      calls.push(args)
      return d.promise
    }) as unknown as typeof fetch

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
    expect((calls[0] as unknown[])[0]).toBe('/api/projects')
  })

  it("leaves projects empty when response is not ok", async () => {
    const d = deferred<Response>()
    const fetchSpy = (() => d.promise) as unknown as typeof fetch
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
    const fetchSpy = (() => d.promise) as unknown as typeof fetch
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
    const fetch1 = (() => d1.promise) as unknown as typeof fetch

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
    const fetch2 = (() => d2.promise) as unknown as typeof fetch

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
