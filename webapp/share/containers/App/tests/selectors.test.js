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

import { fromJS } from 'immutable'

import {
  selectGlobal,
  makeSelectCurrentUser,
  makeSelectLoading,
  makeSelectError,
  makeSelectRepos,
  makeSelectLocationState
} from '../selectors'

describe('selectGlobal', () => {
  it('should select the global state', () => {
    const globalState = fromJS({})
    const mockedState = fromJS({
      global: globalState
    })
    expect(selectGlobal(mockedState)).toEqual(globalState)
  })
})

describe('makeSelectCurrentUser', () => {
  const currentUserSelector = makeSelectCurrentUser()
  it('should select the current user', () => {
    const username = 'mxstbr'
    const mockedState = fromJS({
      global: {
        currentUser: username
      }
    })
    expect(currentUserSelector(mockedState)).toEqual(username)
  })
})

describe('makeSelectLoading', () => {
  const loadingSelector = makeSelectLoading()
  it('should select the loading', () => {
    const loading = false
    const mockedState = fromJS({
      global: {
        loading
      }
    })
    expect(loadingSelector(mockedState)).toEqual(loading)
  })
})

describe('makeSelectError', () => {
  const errorSelector = makeSelectError()
  it('should select the error', () => {
    const error = 404
    const mockedState = fromJS({
      global: {
        error
      }
    })
    expect(errorSelector(mockedState)).toEqual(error)
  })
})

describe('makeSelectRepos', () => {
  const reposSelector = makeSelectRepos()
  it('should select the repos', () => {
    const repositories = fromJS([])
    const mockedState = fromJS({
      global: {
        userData: {
          repositories
        }
      }
    })
    expect(reposSelector(mockedState)).toEqual(repositories)
  })
})

describe('makeSelectLocationState', () => {
  const locationStateSelector = makeSelectLocationState()
  it('should select the route as a plain JS object', () => {
    const route = fromJS({
      locationBeforeTransitions: null
    })
    const mockedState = fromJS({
      route
    })
    expect(locationStateSelector(mockedState)).toEqual(route.toJS())
  })
})
