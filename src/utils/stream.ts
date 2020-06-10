import { ExternalPromise, createExternalPromise } from './js'

export class Stream<T> {
  private _requests: Array<ExternalPromise<StreamResult<T>>> = []
  private _responses: T[] = []
  private _isEnded = false

  get isEnded() {
    return this._isEnded
  }

  get hasReads() {
    return this._requests.length > 0
  }

  get hasWrites() {
    return this._responses.length > 0
  }

  end() {
    if (this._isEnded) return
    this._isEnded = true
    for (const xp of this._requests) {
      xp.resolve({ done: true, value: undefined })
    }
  }

  write(value: T) {
    if (this._isEnded) {
      throw new Error(`Stream is ended!`)
    }
    const requests = this._requests
    if (requests.length) {
      const xp = requests.shift()!
      xp.resolve({ done: false, value })
      return true
    }
    this._responses.push(value)
    return false
  }

  async read() {
    const responses = this._responses
    if (responses.length) {
      const value = responses.shift() as T
      return { done: false as const, value: value }
    }
    if (this._isEnded) {
      return { done: true as const, value: undefined }
    }
    const xp = createExternalPromise<StreamResult<T>>()
    this._requests.push(xp)
    return xp.promise
  }

  readLast() {
    const requests = this._requests
    if (!requests.length) return
    return requests[requests.length - 1].promise
  }
}


export function mergeStreamResults<A extends readonly unknown[]>(args: A): MergeStreamResult<A> {
  let done = false
  const values: unknown[] = []
  for (const arg of args) {
    if (arg.done) {
      done = true
      break
    }
    values.push(arg.value)
  }
  if (done) {
    return { done: true, value: undefined }
  } else {
    return { done: false, value: values } as {} as MergeStreamResult<A>
  }
}

export type StreamResult<T> = {
  done: false
  value: T
} | {
  done: true
  value: undefined
}

export type MergeStreamResult<A extends {}> = {
  done: false
  value: {
    [I in keyof A]: A[I] extends StreamResult<infer U> ? U : unknown
  }
} | {
  done: true
  value: undefined
}
