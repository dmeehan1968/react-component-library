import { Window } from 'happy-dom'

// Minimal Happy DOM bootstrap for RTL under Bun
const win = new Window()

// Copy selected globals
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g: any = globalThis as any
g.window = win as unknown as Window & typeof globalThis
g.document = win.document
g.HTMLElement = win.HTMLElement
g.Node = win.Node
g.CustomEvent = win.CustomEvent
g.navigator = win.navigator
g.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16) as unknown as number
g.cancelAnimationFrame = (id: number) => clearTimeout(id)
