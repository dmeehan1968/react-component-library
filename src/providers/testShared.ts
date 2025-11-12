import { mock } from "bun:test"
import type { FetchImpl } from "./projectsProvider.tsx"

export function deferred<T>() {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

export function okResponse(data: unknown) {
  return {
    ok: true,
    json: async () => data,
  } as Response
}

export function notOkResponse() {
  return {
    ok: false,
    json: async () => ({}),
  } as Response
}

export function createFetchMock(impl: FetchImpl) {
  return mock<FetchImpl>(impl)
}
