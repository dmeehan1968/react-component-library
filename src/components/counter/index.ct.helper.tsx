import type { Locator, MountResult } from '@playwright/experimental-ct-react'
import type { MountFixture } from '@playwright/experimental-ct-react'
import Counter from './index.tsx'

export class CounterCTHelper {
  private mounted!: MountResult

  constructor(mounted: MountResult) {
    this.mounted = mounted
  }

  static async mount(mount: MountFixture) {
    const mounted = await mount(<Counter />)
    return new CounterCTHelper(mounted)
  }

  get root(): Locator {
    return this.mounted
  }

  get countLocator(): Locator {
    return this.mounted.getByTestId('count')
  }

  async count(): Promise<number> {
    const txt = await this.countLocator.textContent()
    return Number(txt)
  }

  get countElement(): Locator {
    return this.mounted.getByTestId('value')
  }

  get incrementBtn(): Locator {
    return this.mounted.getByRole('button', { name: /increment/i })
  }

  get decrementBtn(): Locator {
    return this.mounted.getByRole('button', { name: /decrement/i })
  }

  increment() {
    return this.incrementBtn.click()
  }

  decrement() {
    return this.decrementBtn.click()
  }

  async unmount() {
    await this.mounted.unmount()
  }
}
