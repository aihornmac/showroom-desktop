import { createI18NDefiner } from '../utils/i18n'

export const { i18n, Provider, LocaleContext } = createI18NDefiner<'zh' | 'en' | 'ja'>('zh')
