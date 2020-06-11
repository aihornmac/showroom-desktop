import { ObjectKeyOf, MaybePromise } from './types'

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

export function isPlainObject(value: unknown): value is { [k: string]: unknown } {
  if (value === null || typeof value !== 'object') return false
  const proto: unknown = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

export function createSequancePromise<T = void>() {
  let prev = Promise.resolve()
  let currentCount = 0
  return function then(cb: (index: number) => MaybePromise<T>) {
    const index = currentCount++
    const promise = prev.then(() => cb(index))
    prev = promise.then(noop, console.error)
    return promise
  }
}

export const noop = () => {}


/**
 * determine whether two objects are shallowly euqal
 * - applies only to plain object
 * @param a
 * @param b
 */
export function isEqualShallow(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (
    typeof a === 'string' ||
    typeof a === 'number' ||
    typeof a === 'boolean' ||
    typeof a === 'symbol' ||
    typeof a === 'function' ||
    typeof a === 'bigint'
  ) {
    return false
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return false
    if (a.length !== b.length) return false
    const len = a.length
    for (let i = 0; i < len; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }
  if (!(typeof a === 'object' && typeof b === 'object' && a && b)) {
    return false
  }
  if (!isPlainObject(a) || !isPlainObject(b)) return false
  // a is plain object and b is plain object
  const keys: { [index: string]: number } = {}
  for (const key of Object.keys(a)) {
    keys[key] = 1
  }
  for (const key of Object.keys(b)) {
    keys[key] = (keys[key] || 0) + 1
  }
  for (const count of Object.values(keys)) {
    if (count < 2) return false
  }
  for (const key of Object.keys(a)) {
    if ((a as { [key: string]: unknown })[key] !== (b as { [key: string]: unknown })[key]) {
      return false
    }
  }
  return true
}
