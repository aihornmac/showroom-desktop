export class Disposers {
  protected map = new Map<unknown, () => unknown>()

  add(name: unknown, fn: () => unknown) {
    const { map } = this
    if (map.has(name)) {
      throw new Error(`Disposer ${name} is already defined`)
    }
    map.set(name, fn)
    return this
  }

  override(name: unknown, fn: () => unknown) {
    const { map } = this
    const dispose = map.get(name)
    if (typeof dispose === 'function') {
      dispose()
    }
    map.set(name, fn)
    return this
  }

  dispose(name: unknown) {
    const { map } = this
    const fn = map.get(name)
    if (fn) {
      fn()
      map.delete(name)
    }
    return this
  }

  clear() {
    const { map } = this
    for (const fn of map.values()) {
      fn()
    }
    map.clear()
  }
}
