import type { ComponentFixtures, MountResult } from '@playwright/experimental-ct-react'
import App from './App.tsx'

export class AppHelper {
  private readonly root: MountResult

  private constructor(root: MountResult) {
    this.root = root
  }

  static async mount(mount: ComponentFixtures['mount']): Promise<AppHelper> {
    return new AppHelper(await mount(<App />))
  }

  get rootContainer() {
    // The App's top-level wrapper uses Tailwind utilities to center content.
    // Select the element that has all three classes to assert centering semantics.
    return this.root.locator('div.flex.items-center.justify-center').first()
  }

  get counter() {
    return this.root.getByTestId('counter')
  }

  get viteLink() {
    return this.root.getByRole('link', { name: /vite/i })
  }

  get reactLink() {
    return this.root.getByRole('link', { name: /react/i })
  }

  async getRootStyles() {
    const el = this.rootContainer
    return el.evaluate((node) => {
      const cs = window.getComputedStyle(node as HTMLElement)
      return {
        display: cs.display,
        alignItems: (cs as any).alignItems,
        justifyContent: (cs as any).justifyContent,
      }
    })
  }

  async isContentCentered(): Promise<boolean> {
    // Start from a known child element (the main heading) and walk up
    // to see if any ancestor applies the expected centering utilities.
    const heading = this.root.getByRole('heading', { name: /vite \+ react/i })
    return heading.evaluate((node) => {
      let el: HTMLElement | null = node as HTMLElement
      while (el) {
        const cl = el.classList
        if (cl && cl.contains('flex') && cl.contains('items-center') && cl.contains('justify-center')) {
          return true
        }
        el = el.parentElement
      }
      return false
    })
  }
}
