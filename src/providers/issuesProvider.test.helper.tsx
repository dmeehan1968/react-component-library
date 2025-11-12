import { render, screen, within } from "@testing-library/react"
import { type IssuesProviderProps, IssuesProvider } from "./issuesProvider.tsx"
import { useIssues } from "../hooks/useIssues.tsx"

// A small test consumer that renders the context state in the DOM so tests can assert easily
function IssuesStateProbe() {
  const ctx = useIssues()

  if ("isLoading" in ctx) {
    return <div data-testid="state">loading:{String(ctx.isLoading)}</div>
  }
  if ("error" in ctx) {
    return <div data-testid="state">error:{ctx.error}</div>
  }
  return (
    <div data-testid="state">issues:{JSON.stringify(ctx.issues)}</div>
  )
}

export class IssuesProviderHelper {
  private static lastRender: ReturnType<typeof render> | null = null

  static renderWithProvider(fetchImpl: NonNullable<IssuesProviderProps["fetchImpl"]>, projectId = "proj-1") {
    this.lastRender = render(
      <IssuesProvider fetchImpl={fetchImpl} projectId={projectId}>
        <IssuesStateProbe />
      </IssuesProvider>
    )
    return this.lastRender
  }

  static get state() {
    if (this.lastRender) {
      return within(this.lastRender.container).getByTestId("state")
    }
    return screen.getByTestId("state")
  }
}
