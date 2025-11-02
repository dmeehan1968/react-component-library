import { useState } from 'react'

export interface CounterProps {
  initial?: number
  step?: number
}

export function Counter({ initial = 0, step = 1 }: CounterProps = {}) {
  const [count, setCount] = useState(initial)
  return (
    <div className="w-full" data-testid="counter">
      <div className="inline-flex items-center gap-3">
        <button
          className="btn btn-lg btn-primary h-12 w-24 min-h-12 min-w-24"
          aria-label="decrement"
          onClick={() => setCount((c) => c - step)}
        >
          −
        </button>
        <span
          data-testid="value"
          className="badge badge-lg tabular-nums min-w-[12ch] justify-center text-center"
        >
          count is <span data-testid="count">{count}</span>
        </span>
        <button
          className="btn btn-lg btn-primary h-12 w-24 min-h-12 min-w-24"
          aria-label="increment"
          onClick={() => setCount((c) => c + step)}
        >
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
