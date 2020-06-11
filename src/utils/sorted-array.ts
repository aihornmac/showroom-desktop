export class SortedArray<T> {
  private _arr: T[]

  constructor(
    initialValues?: Iterable<T>,
    private _compare: (a: T, b: T) => number = defaultCompareFn,
    createArray: () => T[] = defaultCreateArray
  ) {
    this._arr = createArray()
    if (initialValues) {
      for (const value of initialValues) {
        this.insert(value)
      }
    }
  }

  get length() {
    return this._arr.length
  }

  get(index: number): T {
    return this._arr[index]
  }

  slice(start?: number, end?: number) {
    const instance: this = Object.create(Object.getPrototypeOf(this))
    instance._arr = this._arr.slice(start, end)
    instance._compare = this._compare
    return instance
  }

  splice(start: number, deleteCount?: number) {
    return this._arr.splice(start, deleteCount)
  }

  insert(item: T) {
    const arr = this._arr
    const compare = this._compare
    const lastIndex = arr.length - 1
    let low = 0
    let high = lastIndex
    let pos = -1
    while (low <= high) {
      const index = (high + low) / 2 >>> 0
      const ordering = compare(arr[index], item)
      if (ordering < 0) {
        low = index + 1
      } else if (ordering > 0) {
        high = index - 1
      } else {
        pos = index
        break
      }
    }
    if (pos === -1) {
      pos = high
    }
    pos++
    while ((pos <= lastIndex) && (compare(item, arr[pos]) === 0)) {
      pos++
    }
    arr.splice(pos, 0, item)
    return this
  }

  indexOf(item: T) {
    const arr = this._arr
    const compare = this._compare
    let low = 0
    let high = arr.length - 1
    while (low <= high) {
      const index = (high + low) / 2 >>> 0
      const ordering = compare(arr[index], item)
      if (ordering < 0) {
        low = index + 1
      } else if (ordering > 0) {
        high = index - 1
      } else {
        return index
      }
    }
    return -1
  }

  includes(item: T) {
    return this.indexOf(item) >= 0
  }

  remove(item: T) {
    const pos = this.indexOf(item)
    if (pos >= 0) this._arr.splice(pos, 1)
    return this
  }

  * [Symbol.iterator]() {
    yield * this._arr
  }
}

export function defaultCompareFn<T>(a: T, b: T) {
  return a < b ? -1 : a > b ? 1 : 0
}

export function defaultCreateArray<T>(): T[] {
  return []
}
