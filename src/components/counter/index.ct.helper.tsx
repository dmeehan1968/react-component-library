import type { Locator } from '@playwright/experimental-ct-core'

export class CounterHelper {
  private readonly countNode: Locator
  readonly countElement: Locator
  readonly incrementBtn: Locator
  readonly decrementBtn: Locator

  constructor(root: Locator) {
    this.countNode = root.getByTestId('count')
    this.countElement = root.getByTestId('value')
    this.incrementBtn = root.getByRole('button', { name: /increment/i })
    this.decrementBtn = root.getByRole('button', { name: /decrement/i })
  }

  private readCount = async (): Promise<number> => {
    const txt = await this.countNode.textContent()
    return Number(txt)
  }

  // Thenable function properties so `expect(counter.increment).resolves` works
  increment = (() => {
    const fn = async () => {
      await this.incrementBtn.click()
      return await this.readCount()
    }
    const thenable = fn as (typeof fn) & PromiseLike<number>
    (thenable as unknown as {
      then: PromiseLike<number>['then']
    }).then = ((onfulfilled?: (value: number) => unknown, onrejected?: (reason: unknown) => unknown) =>
      Promise.resolve(fn()).then(onfulfilled, onrejected)) as PromiseLike<number>['then']
    return thenable
  })()

  decrement = (() => {
    const fn = async () => {
      await this.decrementBtn.click()
      return await this.readCount()
    }
    const thenable = fn as (typeof fn) & PromiseLike<number>
    (thenable as unknown as {
      then: PromiseLike<number>['then']
    }).then = ((onfulfilled?: (value: number) => unknown, onrejected?: (reason: unknown) => unknown) =>
      Promise.resolve(fn()).then(onfulfilled, onrejected)) as PromiseLike<number>['then']
    return thenable
  })()
}