import { describe, it, expect } from "bun:test"
import { screen, waitFor, render } from "@testing-library/react"
import { IssuesProvider } from "./issuesProvider.tsx"
import { IssuesProviderHelper, IssuesStateProbe } from "./issuesProvider.test.helper.tsx"
import { deferred, okResponse, notOkResponse, createFetchMock } from "./testShared.ts"

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
    const { promise, resolve } = deferred<Response>()
    const fetchSpy = createFetchMock(() => promise)

    const projectId = "proj X"
    const { container } = IssuesProviderHelper.renderWithProvider(fetchSpy, projectId)

    // Immediately after mount we should see loading:true
    expect(IssuesProviderHelper.state.textContent).toBe("loading:true")

    // Resolve with a successful response
    const issues = [makeIssue({ id: "i1" })]
    resolve(okResponse(issues))

    await waitFor(() => {
      expect(IssuesProviderHelper.state.textContent).toBe(`issues:${JSON.stringify(issues)}`)
    })

    // loading should be false now and no residual nodes
    expect(container.textContent?.includes("loading:true")).toBe(false)

    // Ensure correct endpoint and encoded project id used
    expect(fetchSpy.mock.calls).toEqual([[`/api/projects/${encodeURIComponent(projectId)}/issues`]])
  })

  it("leaves issues empty when response is not ok", async () => {
    const { promise, resolve } = deferred<Response>()
    const fetchSpy = createFetchMock(() => promise)
    IssuesProviderHelper.renderWithProvider(fetchSpy, "p-1")

    // in-flight
    expect(IssuesProviderHelper.state.textContent).toBe("loading:true")

    resolve(notOkResponse())

    await waitFor(() => {
      expect(IssuesProviderHelper.state.textContent).toBe("issues:[]")
    })
  })

  it("sets error when fetch throws", async () => {
    const { promise, reject } = deferred<Response>()
    const fetchSpy = createFetchMock(() => promise)
    IssuesProviderHelper.renderWithProvider(fetchSpy, "p-1")

    // trigger rejection
    const err = new Error("network down")
    reject(err)

    await waitFor(() => {
      expect(IssuesProviderHelper.state.textContent).toBe(`error:${err.message}`)
    })
  })

  it("re-fetches when fetchImpl reference changes", async () => {
    // first fetch resolves to []
    const deferred1 = deferred<Response>()
    const fetch1 = createFetchMock(() => deferred1.promise)

    const projectId = "with spaces"
    const r = render(
      <IssuesProvider fetchImpl={fetch1} projectId={projectId}>
        <IssuesStateProbe />
      </IssuesProvider>
    )

    deferred1.resolve(okResponse([]))
    await waitFor(() => {
      expect(screen.getByTestId('state').textContent).toBe('issues:[]')
    })

    // Now rerender with a new fetch impl
    const deferred2 = deferred<Response>()
    const issues = [makeIssue({ id: "i-2" })]
    const fetch2 = createFetchMock(() => deferred2.promise)

    r.rerender(
      <IssuesProvider fetchImpl={fetch2} projectId={projectId}>
        <IssuesStateProbe />
      </IssuesProvider>
    )

    // Should enter loading again after fetchImpl changed
    expect(screen.getByTestId('state').textContent).toBe('loading:true')

    deferred2.resolve(okResponse(issues))
    await waitFor(() => {
      expect(screen.getByTestId('state').textContent).toBe(`issues:${JSON.stringify(issues)}`)
    })

    r.unmount()
  })
})
