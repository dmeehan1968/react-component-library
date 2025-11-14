import type { ComponentFixtures, MountResult } from '@playwright/experimental-ct-react'
import App from './App.tsx'

export class AppHelper {
  readonly root: MountResult

  private constructor(root: MountResult) {
    this.root = root
  }

  static async mount(mount: ComponentFixtures['mount']): Promise<AppHelper> {
    return new AppHelper(await mount(<App />))
  }

}
