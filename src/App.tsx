import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { IssuesView } from './components/issues'
import { NotFoundView } from "./components/NotFoundView.tsx"
import { ProjectTableView } from './components/project-table'
import { ProjectsProvider } from './providers/projectsProvider.tsx'
import { Breadcrumbs } from './components/breadcrumbs'

function App() {
  return (
    <BrowserRouter>
      <ProjectsProvider>
        <div className="min-h-screen flex flex-col gap-6 p-6 bg-base-100 text-base-content">
          <Breadcrumbs />
          <div className="w-full">
            <Routes>
              <Route path="/" element={<ProjectTableView/>} />
              <Route path="/projects/:projectId/issues" element={<IssuesView/>}/>
              <Route path="*" element={<NotFoundView/>}/>
            </Routes>
          </div>
        </div>
      </ProjectsProvider>
    </BrowserRouter>
  )
}

export default App
