import type { ComponentFixtures, MountResult } from "@playwright/experimental-ct-react"
import type { Locator } from "@playwright/test"
import { TableMessage, type TableMessageProps } from "./index.tsx"

export class TableMessageHelper {
  private _root: MountResult | undefined = undefined
  private readonly testId: string
  private readonly _mount: ComponentFixtures['mount']

  constructor(mount: ComponentFixtures['mount'], testId: string) {
    this._mount = mount
    this.testId = testId
  }

  get root(): Locator {
    if (!this._root) {
      throw new Error('TableMessageHelper not mounted')
    }
    return this._root
  }

  async mount(props: Omit<TableMessageProps, 'testId'>) {
    if (this._root) {
      await this._root.unmount()
    }
    this._root = await this._mount(
      <table className="table h-full">
        <tbody>
          <TableMessage {...props} testId={this.testId} />
        </tbody>
      </table>
    )
  }

  get text() {
    return this.root.getByTestId(this.testId)
  }

  async textTagName() {
    return this.text.evaluate(el => el.tagName)
  }

  async rowTagName() {
    const row = this.text.locator('xpath=ancestor::tr[1]')
    return row.evaluate(el => el.tagName)
  }

  async colSpan() {
    const value = await this.text.getAttribute('colspan')
    return value ? Number.parseInt(value, 10) : undefined
  }

  async textContent() {
    const text = await this.text.textContent()
    return text?.trim() ?? ''
  }
}
