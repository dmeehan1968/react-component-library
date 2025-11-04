import { Window } from 'happy-dom'

const win = new Window()

type GlobalAugment = typeof globalThis & {
  window: Window & typeof globalThis
  document: Document
  navigator: Navigator
  HTMLElement: typeof win.HTMLElement
  Node: typeof win.Node
  Event: typeof win.Event
}

const g = globalThis as unknown as GlobalAugment

g.window = win as unknown as Window & typeof globalThis
;(() => {
  g.document = win.document as unknown as Document
  g.navigator = win.navigator as unknown as Navigator
  g.HTMLElement = win.HTMLElement as unknown as typeof win.HTMLElement
  g.Node = win.Node as unknown as typeof win.Node
  g.Event = win.Event as unknown as typeof win.Event
})()
