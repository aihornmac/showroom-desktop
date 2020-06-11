import * as React from 'react'
import { isEqualShallow } from './js'

export function useBoxedValue<T>(x: T) {
  const ref = React.useRef(x)
  ref.current = x
  return ref
}

export function useOverrideState<T>(propsValue: T, onChange?: (prev: T, next: T) => unknown) {
  const ref = React.useRef(propsValue)
  const state = React.useState(propsValue)
  let value = state[0]
  if (ref.current !== propsValue) {
    if (onChange) {
      onChange(ref.current, propsValue)
    }
    ref.current = propsValue
    state[1](propsValue)
    value = propsValue
  }
  return [value, state[1]] as const
}

export function useChanged<T>(value: T) {
  const ref = React.useRef(value)
  const changed = React.useRef(false)
  if (ref.current !== value) {
    changed.current = true
  }
  return changed
}

export function useDraftInput<T>(inputValue: T, emitChange: (value: T) => void) {
  const inputValueRef = React.useRef(inputValue)
  const [draftValue, setDraftValue] = React.useState(inputValue)
  const draftValueBox = useBoxedValue(draftValue)
  const emitChangeBox = useBoxedValue(emitChange)

  const onSetValue = React.useMemo(
    () => (value: T) => {
      draftValueBox.current = value
      setDraftValue(value)
    },
    [],
  )

  const onBlur = React.useMemo(
    () => () => {
      const oldValue = inputValueRef.current
      const newValue = draftValueBox.current
      if (newValue === oldValue) return
      emitChangeBox.current(newValue)
    },
    [],
  )

  if (inputValueRef.current !== inputValue) {
    inputValueRef.current = inputValue
    setDraftValue(inputValue)
  }

  return { value: draftValue, setValue: onSetValue, onBlur }
}

export function useShallowEqualCache<T>(value: T) {
  const ref = React.useRef(value)
  if (!isEqualShallow(value, ref.current)) {
    ref.current = value
  }
  return ref.current
}

export function useStateRef<T>(): [React.MutableRefObject<T | undefined>, React.Dispatch<React.SetStateAction<T | undefined>>]
export function useStateRef<T>(initialState: T | (() => T)): [React.MutableRefObject<T>, React.Dispatch<React.SetStateAction<T>>]
export function useStateRef<T>(initialState?: T | (() => T)) {
  const state = React.useState(initialState)
  const ref = useBoxedValue(state[0])
  return [ref, state[1]]
}

export function useStateBox<T>(): {
  get: () => T | undefined
  set: React.Dispatch<React.SetStateAction<T | undefined>>
}
export function useStateBox<T>(initialState: T | (() => T)): {
  get: () => T
  set: React.Dispatch<React.SetStateAction<T>>
}
export function useStateBox<T>(initialState?: T | (() => T)) {
  const state = React.useState(initialState)
  const ref = useBoxedValue(state[0])
  return { get: () => ref.current, set: state[1] }
}


export function useMatchId(initValue = 0) {
  const ref = React.useRef(initValue)
  return function create() {
    const current = ++ref.current
    return () => current === ref.current
  }
}


export type HooksFetcherLike<T, D = undefined> = HooksFetcherCommon<T> &
  (HooksFetcherLoading<D> | HooksFetcherLoaded<T> | HooksFetcherError<D>)

export interface HooksFetcherLoading<T = undefined> {
  readonly state: 'loading'
  readonly result: T
  readonly error: undefined
}

export interface HooksFetcherLoaded<T> {
  readonly state: 'loaded'
  readonly result: T
  readonly error: undefined
}

export interface HooksFetcherError<T = undefined> {
  readonly state: 'error'
  readonly result: T
  readonly error: unknown
}

export interface HooksFetcherCommon<T> extends Pick<PromiseLike<T>, 'then'> {}

export function useFetcherLike<T>(
  deps: readonly unknown[] | undefined,
  factory: () => T | PromiseLike<T>,
): HooksFetcherLike<T>
export function useFetcherLike<T>(
  deps: readonly unknown[] | undefined,
  factory: () => T | PromiseLike<T>,
  defaultValue: T | (() => T),
): HooksFetcherLike<T, T>
export function useFetcherLike<T>(
  deps: readonly unknown[] | undefined,
  factory: () => T | PromiseLike<T>,
  defaultValue?: T | (() => T),
): HooksFetcherLike<T> {
  // tslint:disable-next-line:interface-over-type-literal
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  type Resolver = {
    resolve: (value: T) => unknown
    reject: (reason: unknown) => unknown
  }

  const [state, setState] = React.useState<'loaded' | 'loading' | 'error'>('loading')
  const [result, setResult] = React.useState<T | undefined>(defaultValue)
  const defaultValueRef = React.useRef(result)
  const [error, setError] = React.useState<unknown>(undefined)
  const resolvers = React.useRef<Resolver[]>([]).current

  const onThen = React.useMemo(() => {
    function then<T1 = T, T2 = never>(
      resolve?: ((value: T) => T1 | PromiseLike<T1>) | undefined | null,
      reject?: ((reason: unknown) => T2 | PromiseLike<T2>) | undefined | null,
    ): Promise<T1 | T2>
    function then(
      resolve?: ((value: T) => unknown) | undefined | null,
      reject?: ((reason: unknown) => unknown) | undefined | null,
    ) {
      return new Promise<T>((res, rej) => {
        const fetcher = fetcherRef.current
        if (fetcher.state === 'loaded') {
          res(fetcher.result)
        } else if (fetcher.state === 'error') {
          rej(fetcher.error)
        } else {
          resolvers.push({ resolve: res, reject: rej })
        }
      }).then(resolve, reject)
    }
    return then
  }, deps)

  React.useEffect(() => {
    let disposed = false
    setState('loading')
    setResult(undefined)
    setError(undefined)
    run()
    async function run() {
      try {
        const ret = await factory()
        if (disposed) return
        setResult(ret)
        setError(undefined)
        setState('loaded')
        for (const { resolve } of resolvers) {
          resolve(ret)
        }
      } catch (e) {
        if (disposed) return
        setError(e)
        setState('error')
        setResult(undefined)
        for (const { reject } of resolvers) {
          reject(reject)
        }
      }
    }
    return () => {
      disposed = true
    }
  }, deps)

  const fetcherDraft = { state, result, error, then: onThen }
  if (fetcherDraft.state === 'loading') {
    fetcherDraft.result = defaultValueRef.current
  }

  const fetcherRef = useBoxedValue(useShallowEqualCache(fetcherDraft as HooksFetcherLike<T>))

  return fetcherRef.current
}
