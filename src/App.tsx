import { ProjectTableView } from './components/project-table'
import { ProjectsProvider } from './providers/projectsProvider.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { IssuesView } from './components/issues'

function App() {
  return (
    <BrowserRouter>
      <ProjectsProvider>
        <div className="min-h-screen flex flex-col gap-6 p-6 bg-base-100 text-base-content">
          <div className="w-full">
            <Routes>
              <Route path="/" element={<ProjectTableView/>} />
              <Route path="/projects/:projectId/issues" element={<IssuesView/>} />
            </Routes>
          </div>
        </div>
      </ProjectsProvider>
    </BrowserRouter>
  )
}

export default App
