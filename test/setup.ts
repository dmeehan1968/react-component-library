// Bun test preload: register a DOM for React Testing Library
// We use happy-dom to provide window/document globals under Bun's test runner.
import { GlobalRegistrator } from '@happy-dom/global-registrator'
// Register custom matchers for tests (expect.extend)
import './matchers.ts'

// Register before tests run
GlobalRegistrator.register()

// Optional: simple cleanup hook. RTL provides cleanup afterEach in v16 automatically via user-event
// but we keep this minimal and focused on DOM availability.

// If you need to expose additional globals for tests, do it here.
