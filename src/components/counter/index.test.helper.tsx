import type { ComponentFixtures, MountResult } from "@playwright/experimental-ct-react"
import Counter, { type CounterProps } from "./index.tsx"

export class CounterHelper {
  private readonly root: MountResult

  protected constructor(root: MountResult) {
    this.root = root
  }

  static async mount(mount: ComponentFixtures['mount'], props: CounterProps = {}): Promise<CounterHelper> {
    return new CounterHelper(await mount(<Counter {...props} />))
  }
  private get countElement() {
    return this.root.getByTestId('count')
  }

  get valueElement() {
    return this.root.getByTestId('value')
  }

  get incrementBtn() {
    return this.root.getByRole('button', { name: /increment/i })
  }

  get decrementBtn() {
    return this.root.getByRole('button', { name: /decrement/i })
  }

  async update(props: CounterProps = {}): Promise<void> {
    // Use key= to force remount when props change
    await this.root.update(<Counter key={`init-${props.initial}`} {...props} />)
  }

  get count() {
    return this.countElement.textContent().then(Number)
  }

  async increment() {
    await this.incrementBtn.click()
    return this
  }

  async decrement() {
    await this.decrementBtn.click()
    return this
  }
}