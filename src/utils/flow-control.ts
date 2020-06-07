import { MaybePromise } from './types'

export async function niceToHave<T>(request: () => MaybePromise<T>): Promise<T | undefined> {
  try {
    return await request()
  } catch (e) {
    console.error(e)
    return
  }
}

export function niceToHaveSync<T>(request: () => T): T | undefined {
  try {
    return request()
  } catch (e) {
    console.error(e)
    return
  }
}

export type SafeResult<T> = {
  state: 'resolved'
  result: T
} | {
  state: 'rejected'
  error: unknown
}

export async function runSafely<T>(fn: () => T | PromiseLike<T>): Promise<SafeResult<T>> {
  try {
    const result = await fn()
    return { state: 'resolved', result }
  } catch (e) {
    return { state: 'rejected', error: e as unknown }
  }
}
