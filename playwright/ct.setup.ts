// Playwright CT setup: register custom matchers and any globals needed for component tests
import { expect } from '@playwright/experimental-ct-react'
// Ensure CT registers framework hooks for the browser page (no-op but safe)
import '@playwright/experimental-ct-react/register'
import '../test/pw.matchers'

// Re-export expect to help IDEs pick up augmented types in this setup context
export { expect }
