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

export interface EventEmitterMapLike {
  readonly [K: string]: Function
}

export interface TypedEventEmitter<T extends EventEmitterMapLike> extends TypedEventEmitterListener<T>, TypedEventEmitterEmitter<T> {}

export interface TypedEventEmitterListener<T extends EventEmitterMapLike> {
  on<K extends keyof T>(name: K, fn: T[K]): this
  once<K extends keyof T>(name: K, fn: T[K]): this
  off<K extends keyof T>(name?: K, fn?: T[K]): this
}

export interface TypedEventEmitterEmitter<T extends EventEmitterMapLike> {
  emit<K extends keyof T>(name: K, ...args: Params<T[K]>): boolean
}

export type Params<T extends Function> = T extends (...args: infer A) => infer _R ? A : unknown[]
