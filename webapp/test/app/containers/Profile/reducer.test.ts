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

import produce from 'immer'
import reducer, { initialState } from 'app/containers/Profile/reducer'
import actions from 'app/containers/Profile/actions'
import { mockAnonymousAction } from 'test/utils/fixtures'
import { mockStore } from './fixtures'

describe('projectsReducer', () => {
  const { profile, userId } = mockStore
  let state
  beforeEach(() => {
    state = initialState
  })

  it('should return the initial state', () => {
    expect(reducer(void 0, mockAnonymousAction)).toEqual(state)
  })

  it('should handle the  getUserProfile action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.loading = true
    })
    expect(reducer(state, actions.getUserProfile(userId))).toEqual(
      expectedResult
    )
  })

  it('should handle the  relRoleProjectLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.loading = false
      draft.userProfile = profile
    })
    expect(reducer(state, actions.userProfileGot(profile))).toEqual(
      expectedResult
    )
  })
})
