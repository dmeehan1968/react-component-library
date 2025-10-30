import { describe, expect, it } from 'bun:test'
import { afterEach } from "node:test"
import { AppHelper } from "./App.test.helper.tsx"

// App component tests using Bun's test runner + React Testing Library

describe('App', () => {
  let app: AppHelper

  afterEach(() => {
    app?.unmount()
  })

  it('renders title and docs note', () => {
    app = new AppHelper()
    expect(app.title.textContent).toContain('Vite + React')
    expect(app.docsNote).toBeTruthy()
  })

  it('contains the Counter component', () => {
    app = new AppHelper()
    expect(app.counters).toHaveLength(1)
  })
})
