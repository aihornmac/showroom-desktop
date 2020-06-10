import * as React from 'react'

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
