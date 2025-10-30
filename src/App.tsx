import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import Counter from './components/counter'

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-base-100 text-base-content">
      <div className="flex items-center gap-4">
        <a href="https://vite.dev" target="_blank" rel="noreferrer" className="tooltip" data-tip="Vite">
          <img src={viteLogo} className="h-16 w-16 transition hover:drop-shadow-lg" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer" className="tooltip" data-tip="React">
          <img src={reactLogo} className="h-16 w-16 transition hover:drop-shadow-lg" alt="React logo" />
        </a>
      </div>

      <h1 className="text-4xl font-bold">Vite + React</h1>

      <div className="card bg-base-200 shadow-lg w-full max-w-md">
        <div className="card-body items-center text-center">
          <Counter />
        </div>
      </div>

      <p className="text-base-content/70">Click on the Vite and React logos to learn more</p>
    </div>
  )
}

export default App
