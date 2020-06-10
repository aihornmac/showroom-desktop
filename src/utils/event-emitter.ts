export interface EventEmitterMapLike {
  readonly [K: string]: Function
}

export interface EventEmitterCommon<T extends EventEmitterMapLike> extends EventEmitterListenerCommon<T>, EventEmitterEmitterCommon<T> {}

export interface EventEmitterListenerCommon<T extends EventEmitterMapLike> {
  on<K extends keyof T>(name: K, fn: T[K]): this
  once<K extends keyof T>(name: K, fn: T[K]): this
  off<K extends keyof T>(name?: K, fn?: T[K]): this
}

export interface EventEmitterEmitterCommon<T extends EventEmitterMapLike> {
  emit<K extends keyof T>(name: K, ...args: Params<T[K]>): number
}

export interface EventEmitterListener<T extends EventEmitterMapLike> extends EventEmitterListenerCommon<T> {
  count<K extends keyof T>(name: K): number
  subscribe<K extends keyof T>(name: K, fn: T[K]): () => void
}

export interface EventEmitterEmitter<T extends EventEmitterMapLike> extends EventEmitterEmitterCommon<T> {
  emitIterable<K extends keyof T>(name: K, ...args: Params<T[K]>): IterableIterator<undefined>
}

export class EventEmitter<T extends EventEmitterMapLike = EventEmitterMapLike>
  implements EventEmitterListener<T>, EventEmitterEmitter<T> {

  protected _events: { [K in keyof T]?: Array<{ fn: T[K]; times?: number }> | undefined } = {}

  on<K extends keyof T>(name: K, fn: T[K]) {
    const events = this._events
    let list = events[name]
    if (!list) list = events[name] = []
    list.push({ fn })
    return this
  }

  once<K extends keyof T>(name: K, fn: T[K]) {
    const events = this._events
    let list = events[name]
    if (!list) list = events[name] = []
    list.push({ fn, times: 1 })
    return this
  }

  off<K extends keyof T>(name?: K, fn?: Function) {
    if (typeof name === 'string') {
      const events = this._events
      const list = events[name]
      if (list) {
        if (typeof fn === 'function') {
          for (let i = 0; i < list.length; i++) {
            const x = list[i]
            if (x.fn === fn) {
              list.splice(i--, 1)
            }
          }
        } else {
          events[name] = undefined
        }
      }
    } else {
      this._events = {}
    }
    return this
  }

  count<K extends keyof T>(name: K) {
    const events = this._events[name]
    return (events && events.length) || 0
  }

  subscribe<K extends keyof T>(name: K, fn: T[K]) {
    this.on(name, fn)
    return () => {
      this.off(name, fn)
    }
  }

  emit<K extends keyof T>(name: K, ...args: Params<T[K]>) {
    let count = 0
    for (const __ of this.emitIterable(name, ...args)) {
      count++
    }
    return count
  }

  *emitIterable<K extends keyof T>(name: K, ...args: Params<T[K]>) {
    const list = this._events[name]
    if (list) {
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        const times = typeof item.times === 'number' ? --item.times : Infinity
        if (times <= 0) {
          list.splice(i--, 1)
        }
        if (times >= 0) {
          const { fn } = item
          fn(...args)
          yield
        }
      }
    }
  }
}

type Params<T extends Function> = T extends (...args: infer A) => infer _R ? A : unknown[]
