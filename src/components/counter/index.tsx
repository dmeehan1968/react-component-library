import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div className="w-full" data-testid="counter">
      <div className="inline-flex items-center gap-3">
        <button className="btn btn-circle" aria-label="decrement" onClick={() => setCount((c) => c - 1)}>
          −
        </button>
        <span data-testid="value" className="badge badge-lg">count is {count}</span>
        <button className="btn btn-circle" aria-label="increment" onClick={() => setCount((c) => c + 1)}>
          +
        </button>
      </div>
      <p className="mt-3 text-sm opacity-70">
        Edit <code>src/features/counter/Counter.tsx</code> and save to test HMR
      </p>
    </div>
  )
}

export default Counter
