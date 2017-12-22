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

import React from 'react'
import { shallow, mount } from 'enzyme'
import { FormattedMessage, defineMessages } from 'react-intl'
import { Provider } from 'react-redux'
import { browserHistory } from 'react-router'

import ConnectedLanguageProvider, { LanguageProvider } from '../index'
import configureStore from '../../../store'

import { translationMessages } from '../../../i18n'

const messages = defineMessages({
  someMessage: {
    id: 'some.id',
    defaultMessage: 'This is some default message',
    en: 'This is some en message'
  }
})

describe('<LanguageProvider />', () => {
  it('should render its children', () => {
    const children = (<h1>Test</h1>)
    const renderedComponent = shallow(
      <LanguageProvider messages={messages} locale="en">
        {children}
      </LanguageProvider>
    )
    expect(renderedComponent.contains(children)).toBe(true)
  })
})

describe('<ConnectedLanguageProvider />', () => {
  let store

  beforeAll(() => {
    store = configureStore({}, browserHistory)
  })

  it('should render the default language messages', () => {
    const renderedComponent = mount(
      <Provider store={store}>
        <ConnectedLanguageProvider messages={translationMessages}>
          <FormattedMessage {...messages.someMessage} />
        </ConnectedLanguageProvider>
      </Provider>
    )
    expect(renderedComponent.contains(<FormattedMessage {...messages.someMessage} />)).toBe(true)
  })
})
