import { useMemo } from 'react'
import { observable, runInAction } from 'mobx'
import { isPlainObject } from './js'

const EMPTY_ARRAY: never[] = []

const EMPTY_OBJECT: {} = {}

const DEFAULT_OPTIONS = { deep: false } as const

export function useSource<T>(current: T) {
  const source = useMemo(() => observable(current, EMPTY_OBJECT, DEFAULT_OPTIONS), EMPTY_ARRAY)
  if (process.env.NODE_ENV !== 'production') {
    // tslint:disable-next-line: no-commented-code
    // if (Object.keys(current).length !== Object.keys(source).length) {
    //   throw new Error(`the shape of passed sources should be stable`)
    // }
    // tslint:disable-next-line: no-collapsible-if
    if (!isPlainObject(current)) {
      console.warn(`the passed source is not plain object`)
    }
  }
  runInAction(() => {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (Object.prototype.hasOwnProperty.call(current, key)) continue
        (source as unknown as Record<string, unknown>)[key] = undefined
      }
    }
    Object.assign(source, current)
  })
  return source
}

export function useLocalStore<TStore, TSource extends {}>(
  initializer: (source: TSource) => TStore,
  current: TSource,
): TStore {
  const source = useSource(current)
  return useMemo(() => initializer(source), EMPTY_ARRAY)
}
