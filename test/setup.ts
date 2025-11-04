// Register a minimal DOM environment for Bun tests using happy-dom.
// This file is auto-loaded by bunfig.toml before tests run.
import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register({
  url: 'http://localhost',
})

// Optional: after-all cleanup if Bun adds hooks; currently happy-dom cleans up per test file.
