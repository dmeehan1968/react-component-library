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

  it('increments count on click', async () => {
    app = new AppHelper()
    expect(app.counter.textContent).toContain('count is 0')
    await app.increment()
    expect(app.counter.textContent).toContain('count is 1')
    await app.increment()
    expect(app.counter.textContent).toContain('count is 2')
  })
})
