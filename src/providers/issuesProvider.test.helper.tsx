import { render, screen } from "@testing-library/react"
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
  static renderWithProvider(fetchImpl: NonNullable<IssuesProviderProps["fetchImpl"]>, projectId = "proj-1") {
    return render(
      <IssuesProvider fetchImpl={fetchImpl} projectId={projectId}>
        <IssuesStateProbe />
      </IssuesProvider>
    )
  }

  static get state() {
    return screen.getByTestId("state")
  }
}
