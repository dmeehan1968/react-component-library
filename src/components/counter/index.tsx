import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div className="card" data-testid="counter">
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <button aria-label="decrement" onClick={() => setCount((c) => c - 1)}>
          −
        </button>
        <span data-testid="value">count is {count}</span>
        <button aria-label="increment" onClick={() => setCount((c) => c + 1)}>
          +
        </button>
      </div>
      <p>
        Edit <code>src/features/counter/Counter.tsx</code> and save to test HMR
      </p>
    </div>
  )
}

export default Counter
