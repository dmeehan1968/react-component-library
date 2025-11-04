import '../test/setup'
import { describe, it, expect } from 'bun:test'
import { render } from '@testing-library/react'
import { within } from '@testing-library/dom'
import App from './App'

describe('App (unit)', () => {
  it('renders title and helpful text', () => {
    render(<App />)
    const body = within(document.body)
    expect(body.getByRole('heading', { name: /vite \+ react/i })).toBeTruthy()
    expect(body.getByText(/click on the vite and react logos to learn more/i)).toBeTruthy()
  })

  it('contains links to vite and react websites', () => {
    render(<App />)
    const body = within(document.body)
    expect(body.getByRole('link', { name: /vite/i }).getAttribute('href')).toBe('https://vite.dev')
    expect(body.getByRole('link', { name: /react/i }).getAttribute('href')).toBe('https://react.dev')
  })
})
