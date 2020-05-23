/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

/**
 * i18n.js
 *
 * This will setup the i18n language files and locale data for your app.
 *
 */
const addLocaleData = require('react-intl').addLocaleData
const enLocaleData = require('react-intl/locale-data/en')
const zhLocaleData = require('react-intl/locale-data/zh')

const enTranslationMessages = require('./translations/en.json')
const zhTranslationMessages = require('./translations/zh.json')

addLocaleData(enLocaleData)
addLocaleData(zhLocaleData)

export const DEFAULT_LOCALE = 'en'

export const appLocales = [
  'en',
  'zh'
]

export const formatTranslationMessages = (locale, messages) => {
  const defaultFormattedMessages =
    locale !== DEFAULT_LOCALE
      ? formatTranslationMessages(DEFAULT_LOCALE, enTranslationMessages)
      : {}
  const flattenFormattedMessages = (formattedMessages, key) => {
    const formattedMessage =
      !messages[key] && locale !== DEFAULT_LOCALE
        ? defaultFormattedMessages[key]
        : messages[key]
    return {
      ...formattedMessages,
      [key]: formattedMessage
    }
  }
  return Object.keys(messages).reduce(flattenFormattedMessages, {})
}

export const translationMessages = {
  en: formatTranslationMessages('en', enTranslationMessages),
  zh: formatTranslationMessages('zh', zhTranslationMessages)
}
