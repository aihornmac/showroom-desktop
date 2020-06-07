export type MethodKeysOf<T> = { [P in keyof T]-?: T[P] extends Function ? P : never }[keyof T]

export type MaybePromise<T> = T | PromiseLike<T>

export type ObjectEntryOf<T> = (
  T extends ReadonlyMap<infer K, infer V> ? [K, V] :
  T extends ReadonlyArray<infer U> ? [string, U] :
  T extends Readonly<Record<string, unknown>> ? Exclude<{ -readonly [P in keyof T]: [P, T[P]] }[keyof T], undefined> :
  never
)

export type ObjectKeyOf<T> = (
  T extends ReadonlyMap<infer K, unknown> ? K :
  T extends ReadonlyArray<unknown> ? string :
  T extends Readonly<Record<string, unknown>> ? keyof T :
  never
)

export type IsTypeAnyOrUnknown<T, A = true, B = false> = unknown extends T ? A : B
