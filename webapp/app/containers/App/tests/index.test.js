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
import { shallow } from 'enzyme'

import Header from 'components/Header'
import Footer from 'components/Footer'
import { App } from '../index'

describe('<App />', () => {
  it('should render the header', () => {
    const renderedComponent = shallow(
      <App />
    )
    expect(renderedComponent.find(Header).length).toBe(1)
  })

  it('should render its children', () => {
    const children = (<h1>Test</h1>)
    const renderedComponent = shallow(
      <App>
        {children}
      </App>
    )
    expect(renderedComponent.contains(children)).toBe(true)
  })

  it('should render the footer', () => {
    const renderedComponent = shallow(
      <App />
    )
    expect(renderedComponent.find(Footer).length).toBe(1)
  })
})
