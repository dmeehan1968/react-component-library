import ctReact from "@playwright/experimental-ct-react"

import { TableMessageHelper } from "./index.ctspec.helper.tsx"

const testId = 'table-message'

const test = ctReact.test.extend<{ message: TableMessageHelper }>({
  message: async ({ mount }, provide) => {
    const helper = new TableMessageHelper(mount, testId)
    await helper.mount({ message: 'Hello World' })
    await provide(helper)
  },
})

const expect = ctReact.expect

test.describe('TableMessage', () => {

  test('should render a table row with a single cell', async ({ message }) => {
    await expect(message.text).toHaveCount(1)
    expect(await message.textTagName()).toBe('TD')
    expect(await message.rowTagName()).toBe('TR')
  })

  test('should render provided message text', async ({ message }) => {
    await expect(message.text).toHaveText(/hello world/i)
    expect(await message.textContent()).toBe('Hello World')
  })

  test('should span 3 columns', async ({ message }) => {
    ctReact.expect(await message.colSpan()).toBe(3)
  })

  test('should merge and preserve classes when className is provided', async ({ message }) => {
    await message.mount({ message: 'With Class', className: 'text-error' })
    await expect(message.text).toHaveClass(/\btext-center\b/)
    await expect(message.text).toHaveClass(/\balign-middle\b/)
    await expect(message.text).toHaveClass(/\btext-error\b/)
  })

})
