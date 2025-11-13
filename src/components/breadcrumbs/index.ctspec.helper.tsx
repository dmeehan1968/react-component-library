import type { ComponentFixtures, MountResult } from "@playwright/experimental-ct-react"
import type { Locator } from "@playwright/test"
import { MemoryRouter } from "react-router-dom"
import { ProjectsContext, type Project, type ProjectsContextType } from "../../providers/projectsContext.tsx"
import { Breadcrumbs, type BreadcrumbsProps } from "./index.tsx"

const demoProjects: Project[] = [
  {
    name: 'React Component Library',
    url: '/projects/react-component-library/issues',
    lastUpdated: new Date('2025-11-12T00:00:00.000Z'),
    issueCount: 0,
  },
]

export class BreadcrumbsHelper {
  private readonly _root: MountResult

  private constructor(root: MountResult) {
    this._root = root
  }

  static async mount(mount: ComponentFixtures['mount'], props: BreadcrumbsProps = {}): Promise<BreadcrumbsHelper> {
    // Default mount at root path
    return this.mountAtPath(mount, '/', props)
  }

  static async mountAtPath(mount: ComponentFixtures['mount'], path: string, props: BreadcrumbsProps = {}): Promise<BreadcrumbsHelper> {
    const ctx: ProjectsContextType = { projects: demoProjects }
    const root = await mount(
      <MemoryRouter initialEntries={[path]}>
        <ProjectsContext value={ctx}>
          <Breadcrumbs {...props} />
        </ProjectsContext>
      </MemoryRouter>
    )
    return new BreadcrumbsHelper(root)
  }

  get root(): MountResult { return this._root }

  get nav(): Locator {
    return this._root.getByRole('navigation', { name: 'Breadcrumb' })
  }

  get itemCount(): Promise<number> {
    // Count list items within the mounted component root for robustness.
    return this._root.locator('li').count()
  }

  linkByName(name: string): Locator {
    return this._root.getByRole('link', { name })
  }

  text(name: string): Locator {
    return this._root.getByText(name)
  }
}
