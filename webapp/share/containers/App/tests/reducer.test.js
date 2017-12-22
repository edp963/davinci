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

import appReducer from '../reducer'
import {
  loadRepos,
  reposLoaded,
  repoLoadingError
} from '../actions'

describe('appReducer', () => {
  let state
  beforeEach(() => {
    state = fromJS({
      loading: false,
      error: false,
      currentUser: false,
      userData: fromJS({
        repositories: false
      })
    })
  })

  it('should return the initial state', () => {
    const expectedResult = state
    expect(appReducer(undefined, {})).toEqual(expectedResult)
  })

  it('should handle the loadRepos action correctly', () => {
    const expectedResult = state
      .set('loading', true)
      .set('error', false)
      .setIn(['userData', 'repositories'], false)

    expect(appReducer(state, loadRepos())).toEqual(expectedResult)
  })

  it('should handle the reposLoaded action correctly', () => {
    const fixture = [{
      name: 'My Repo'
    }]
    const username = 'test'
    const expectedResult = state
      .setIn(['userData', 'repositories'], fixture)
      .set('loading', false)
      .set('currentUser', username)

    expect(appReducer(state, reposLoaded(fixture, username))).toEqual(expectedResult)
  })

  it('should handle the repoLoadingError action correctly', () => {
    const fixture = {
      msg: 'Not found'
    }
    const expectedResult = state
      .set('error', fixture)
      .set('loading', false)

    expect(appReducer(state, repoLoadingError(fixture))).toEqual(expectedResult)
  })
})
