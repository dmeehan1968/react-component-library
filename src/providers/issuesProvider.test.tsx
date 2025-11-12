import { describe, it, expect, mock } from "bun:test"
import { screen, waitFor, render } from "@testing-library/react"
import type { FetchImpl } from "./projectsProvider.tsx"
import { IssuesProvider } from "./issuesProvider.tsx"
import { IssuesProviderHelper } from "./issuesProvider.test.helper.tsx"
import { useIssues } from "../hooks/useIssues.tsx"

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

function createFetchMock(impl: FetchImpl) {
  return mock<FetchImpl>(impl)
}

function makeIssue(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "i-1",
    title: "Issue 1",
    url: "/issues/1",
    project: "proj-1",
    description: "desc",
    timestamp: new Date().toISOString(),
    inputTokens: 10,
    outputTokens: 20,
    cacheTokens: 0,
    cost: 0.12,
    time: 123,
    status: "queued",
    ...overrides,
  }
}

describe("IssuesProvider", () => {
  it("shows loading while fetching and then sets issues on success", async () => {
    const d = deferred<Response>()
    const fetchSpy = createFetchMock(() => d.promise)

    const projectId = "proj X"
    const { container } = IssuesProviderHelper.renderWithProvider(fetchSpy, projectId)

    // Immediately after mount we should see loading:true
    expect(IssuesProviderHelper.state.textContent).toBe("loading:true")

    // Resolve with a successful response
    const issues = [makeIssue({ id: "i1" })]
    d.resolve(okResponse(issues))

    await waitFor(() => {
      expect(IssuesProviderHelper.state.textContent).toBe(`issues:${JSON.stringify(issues)}`)
    })

    // loading should be false now and no residual nodes
    expect(container.textContent?.includes("loading:true")).toBe(false)

    // Ensure correct endpoint and encoded project id used
    expect(fetchSpy.mock.calls).toEqual([[`/api/projects/${encodeURIComponent(projectId)}/issues`]])
  })

  it("leaves issues empty when response is not ok", async () => {
    const d = deferred<Response>()
    const fetchSpy = createFetchMock(() => d.promise)
    IssuesProviderHelper.renderWithProvider(fetchSpy, "p-1")

    // in-flight
    expect(IssuesProviderHelper.state.textContent).toBe("loading:true")

    d.resolve(notOkResponse())

    await waitFor(() => {
      expect(IssuesProviderHelper.state.textContent).toBe("issues:[]")
    })
  })

  it("sets error when fetch throws", async () => {
    const d = deferred<Response>()
    const fetchSpy = createFetchMock(() => d.promise)
    IssuesProviderHelper.renderWithProvider(fetchSpy, "p-1")

    // trigger rejection
    const err = new Error("network down")
    d.reject(err)

    await waitFor(() => {
      expect(IssuesProviderHelper.state.textContent).toBe(`error:${err.message}`)
    })
  })

  it("re-fetches when fetchImpl reference changes", async () => {
    // first fetch resolves to []
    const d1 = deferred<Response>()
    const fetch1 = createFetchMock(() => d1.promise)

    function Probe() {
      const ctx = useIssues()
      if ("isLoading" in ctx) return <div data-testid="state">loading</div>
      if ("error" in ctx) return <div data-testid="state">error</div>
      return <div data-testid="state">issues:{ctx.issues.length}</div>
    }

    const projectId = "with spaces"
    const r = render(
      <IssuesProvider fetchImpl={fetch1} projectId={projectId}>
        <Probe />
      </IssuesProvider>
    )

    d1.resolve(okResponse([]))
    await waitFor(() => {
      expect(screen.getByTestId('state').textContent).toBe('issues:0')
    })

    // Now rerender with a new fetch impl
    const d2 = deferred<Response>()
    const issues = [makeIssue({ id: "i-2" })]
    const fetch2 = createFetchMock(() => d2.promise)

    r.rerender(
      <IssuesProvider fetchImpl={fetch2} projectId={projectId}>
        <Probe />
      </IssuesProvider>
    )

    // Should enter loading again after fetchImpl changed
    expect(screen.getByTestId('state').textContent).toBe('loading')

    d2.resolve(okResponse(issues))
    await waitFor(() => {
      expect(screen.getByTestId('state').textContent).toBe('issues:1')
    })

    r.unmount()
  })
})
