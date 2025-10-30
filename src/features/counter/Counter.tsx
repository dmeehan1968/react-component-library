import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div className="card">
      <button onClick={() => setCount((c) => c + 1)}>
        count is {count}
      </button>
      <p>
        Edit <code>src/features/counter/Counter.tsx</code> and save to test HMR
      </p>
    </div>
  )
}

export default Counter
