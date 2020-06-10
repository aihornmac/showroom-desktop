import { ObjectKeyOf } from './types'

export interface ExternalPromise<T = unknown> {
  promise: Promise<T>
  resolve(value: T | PromiseLike<T>): void
  reject(error: unknown): void
}

export function createExternalPromise<T>(): ExternalPromise<T> {
  type Type = ExternalPromise<T>
  let resolve!: Type['resolve']
  let reject!: Type['reject']
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { resolve, reject, promise }
}

export function once<T>(fn: () => T): () => T {
  let box: { readonly value: T } | undefined
  return function get() {
    return (box || (box = { value: fn() })).value
  }
}

export function predicate<T>(x: T): x is Exclude<T, null | undefined | void | false | 0 | ''> {
  return Boolean(x)
}

export function later(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function cancellableLater(ms: number) {
  const { resolve, promise } = createExternalPromise<boolean>()
  let timer: NodeJS.Timeout | undefined = setTimeout(() => {
    timer = undefined
    resolve(true)
  }, ms)
  const cancel = () => {
    if (!timer) return
    clearTimeout(timer)
    timer = undefined
    resolve(false)
  }
  return { cancel, promise }
}

export function keysOf<T>(x: T): Array<ObjectKeyOf<T>> {
  return Object.keys(x) as Array<ObjectKeyOf<T>>
}

export function isThenable<T>(x: T): x is T & { then: Function } {
  return Boolean(x && typeof (x as { then?: unknown }).then === 'function')
}

export function call<T>(fn: () => T): T {
  return fn()
}

export function times<T>(n: number, map: (i: number) => T) {
  const arr: T[] = new Array(n)
  for (let i = 0; i < n; i++) {
    arr[i] = map(i)
  }
  return arr
}
