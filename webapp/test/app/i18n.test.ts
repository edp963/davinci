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

import { formatTranslationMessages } from 'app/i18n'

jest.mock('app/translations/en.json', () => ({
  message1: 'default message',
  message2: 'default message 2'
}))

const esTranslationMessages = {
  message1: 'mensaje predeterminado',
  message2: ''
}

describe('formatTranslationMessages', () => {
  it('should build only defaults when DEFAULT_LOCALE', () => {
    const result = formatTranslationMessages('en', { a: 'a' })

    expect(result).toEqual({ a: 'a' })
  })

  it('should combine default locale and current locale when not DEFAULT_LOCALE', () => {
    const result = formatTranslationMessages('', esTranslationMessages)

    expect(result).toEqual({
      message1: 'mensaje predeterminado',
      message2: 'default message 2'
    })
  })
})
