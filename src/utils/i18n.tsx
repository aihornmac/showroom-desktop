// tslint:disable interface-name
import * as React from 'react'

type Loose<V> = V | null | undefined | void | 0 | false

export function createI18NDefiner<Locale extends string>(
  defaultValue: Locale,
) {
  type LooseLocale = Loose<Locale>

  type MatchFn = (locale: Loose<ItemOrIterable<Locale>>) => Locale | ''

  type GetFn<T, R> = RequiredKeys<T> extends never ? (
    (locale: LooseLocale, props?: Loose<Partial<T>>) => string | R
  ) : (
    (locale: LooseLocale, props: T) => string | R
  )

  type I18NComponent<T extends {} = {}, R = string> = {
    (props: T): JSX.Element
    match: MatchFn
    get: GetFn<T, R>
  }

  type I18NMap<T, R> = RequiredKeys<T> extends never ? {
    [P in Locale]: (props: Partial<T>) => R
  } : {
    [P in Locale]: (props: T) => R
  }

  type I18NProviderProps = {
    locale: Locale
    children?: React.ReactNode
  }

  /**
   * 创建一个i18n组件
   * @param map 各语言生成函数
   */
  function i18n<T extends {} = {}, R = string>(map: I18NMap<T, R>) {
    const sourceList = Object.keys(map) as Locale[]
    const component = function I18N(props: T) {
      const locale = React.useContext(LocaleContext)
      return get(locale, props)
    }
    const result = component as I18NComponent<T, R>

    const match = result.match = locale => matchLocale(sourceList, locale || '')

    const get: Function = (locale: Loose<Locale>, props: T) => {
      props = props || {} as T
      const matched = match(locale)
      if (!matched) {
        if (!sourceList.length) return ''
        return map[sourceList[0]](props)
      }
      return map[matched](props)
    }
    result.get = get as GetFn<T, R>
    return result
  }

  /**
   * 语言提供者
   * @param props 属性
   */
  function Provider(props: I18NProviderProps) {
    return (
      <LocaleContext.Provider value={props.locale}>
        {props.children}
      </LocaleContext.Provider>
    )
  }

  const LocaleContext = React.createContext<Locale>(defaultValue)

  return { i18n, Provider, LocaleContext }
}

type ItemOrIterable<T extends string> = T | Iterable<T>
type AnyLocale = ItemOrIterable<string>

const localeListCache = new Map<AnyLocale, Map<string, string>>()
const matchedLocaleCache = new Map<AnyLocale, Map<AnyLocale, string | undefined>>()
const splittedLocaleCache = new Map<string, string[]>()

/**
 * 匹配语言
 * @param source 语言提供方
 * @param target 目标语言
 */
export function matchLocale<
  TSource extends string,
  TTarget extends string
>(source: ItemOrIterable<TSource>, target: ItemOrIterable<TTarget>) {
  let map = matchedLocaleCache.get(target)
  if (!map) matchedLocaleCache.set(target, map = new Map())
  let result = map.get(source)
  if (typeof result === 'string') return result as TTarget
  const sourceList = getLocaleList(source)
  const targetList = getLocaleList(target)
  map.set(source, result = matchLocaleMaps(sourceList, targetList))
  return result as TTarget
}

export function *combineLocales(...locales: AnyLocale[]): AnyLocale {
  for (const locale of locales) {
    if (typeof locale === 'string') {
      yield locale
    } else {
      yield *locale
    }
  }
}

function matchLocaleMaps(source: Map<string, string>, target: Map<string, string>) {
  for (const x of target.keys()) {
    if (source.has(x)) return source.get(x)!
  }
  for (const x of source.values()) {
    return x
  }
  return undefined
}

function getLocaleList(locale: AnyLocale) {
  let item = localeListCache.get(locale)
  if (!item) {
    item = new Map()
    const list = typeof locale === 'string' ? [locale] : locale
    for (const x of list) {
      const y = getSplitLocale(x)
      item.set(x, x)
      item.set(y[0], x)
    }
    localeListCache.set(locale, item)
  }
  return item
}

function getSplitLocale(locale: string) {
  let item = splittedLocaleCache.get(locale)
  if (!item) {
    item = locale.split('-')
    splittedLocaleCache.set(locale, item)
  }
  return item
}

/**
 * 获取环境语言
 */
export function getEnvLocales(): string[] {
  if (typeof navigator === 'undefined') {
    return []
  }

  if (Array.isArray(navigator.languages)) {
    return navigator.languages
  }

  if (navigator.language) {
    return [navigator.language]
  }

  return []
}

type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T]

type RequiredKeys<T> = Exclude<KeysOfType<T, Exclude<T[keyof T], undefined>>, undefined>
