import { ExternalPromise, createExternalPromise } from './js'

export interface WritableStream<T> {
  write(value: T): void
}

export class PipeStream<T> {
  protected _requests: Array<ExternalPromise<StreamResult<T>>> = []
  protected _responses: T[] = []
  protected _isEnded = false
  protected _isPaused = false

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
    this._end()
  }

  resume() {
    if (this._isEnded) return
    if (!this._isPaused) return
    this._isPaused = false
    let responses = this._responses
    if (responses.length) {
      let requests = this._requests
      if (requests.length) {
        const length = Math.min(responses.length, requests.length)
        responses = responses.splice(0, length)
        requests = requests.splice(0, length)
        for (let i = 0; i < length; i++) {
          requests[i].resolve({ done: false, value: responses[i] })
        }
      }
    }
  }

  pause() {
    if (this._isEnded) return
    if (this._isPaused) return
    this._isPaused = true
  }

  write(value: T) {
    if (this._isEnded) {
      throw new Error(`Stream is ended!`)
    }
    if (!this._isPaused) {
      const requests = this._requests
      if (requests.length) {
        const xp = requests.shift()!
        xp.resolve({ done: false, value })
        return true
      }
    }
    this._responses.push(value)
    return false
  }

  async read() {
    if (!this._isPaused) {
      const responses = this._responses
      if (responses.length) {
        const value = responses.shift() as T
        return { done: false as const, value: value }
      }
    }
    if (this._isEnded) {
      return { done: true as const, value: undefined }
    }
    const xp = createExternalPromise<StreamResult<T>>()
    this._requests.push(xp)
    return xp.promise
  }

  protected _end() {
    for (const xp of this._requests) {
      xp.resolve({ done: true, value: undefined })
    }
  }
}

export class ObservableStream<T> {
  private _streams = new Set<PipeStream<T>>()

  write(value: T) {
    for (const stream of this._streams) {
      stream.write(value)
    }
  }

  observe() {
    const streams = this._streams
    const me = new ObservableStreamObserver<T>(() => {
      streams.delete(me)
    })
    streams.add(me)
    return me
  }

  async readNext() {
    const observer = this.observe()
    try {
      return await observer.read()
    } finally {
      observer.end()
    }
  }
}

class ObservableStreamObserver<T> extends PipeStream<T> {
  constructor(private readonly _dispose: () => void) {
    super()
  }

  protected _end() {
    this._dispose()
    super.end()
  }
}

export type { ObservableStreamObserver }

export class TakeLastStream<T> extends PipeStream<T> {
  constructor(readonly count = 1) {
    super()
    if (!(count >= 0 && Number.isInteger(count))) {
      throw new Error(`count must be positive integer`)
    }
  }

  write(value: T) {
    const drain = super.write(value)
    if (!drain) {
      const responses = this._responses
      const { length } = responses
      const { count } = this
      const removeCount = length - count
      if (removeCount > 0) {
        responses.splice(-removeCount)
      }
    }
    return drain
  }
}

export function mergeStreamResults<A extends readonly unknown[]>(args: A): MergeStreamResult<A> {
  let done = false
  const values: unknown[] = []
  for (const arg of args as ReadonlyArray<StreamResult<unknown>>) {
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
