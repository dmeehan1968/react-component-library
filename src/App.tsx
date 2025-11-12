import { ProjectTableView } from './components/project-table'
import { ProjectsProvider } from './providers/projectsProvider.tsx'

function App() {
  return (
    <ProjectsProvider>
      <div className="min-h-screen flex flex-col gap-6 p-6 bg-base-100 text-base-content">
        <div className="w-full">
          <ProjectTableView/>
        </div>
      </div>
    </ProjectsProvider>
  )
}

export default App
