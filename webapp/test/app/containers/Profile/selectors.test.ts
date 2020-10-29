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

import {
  selectProfile,
  makeSelectLoading,
  makeSelectUserProfile
} from 'app/containers/Profile/selectors'
import { initialState } from 'app/containers/Profile/reducer'

const state = {
  profile: initialState
}

describe('selectProfile', () => {
  it('should select the selectProfile state', () => {
    expect(selectProfile(state)).toEqual(state.profile)
  })
})

describe('makeSelectProjects', () => {
  const loadingSelector = makeSelectLoading()
  const userProfileSelector = makeSelectUserProfile()


  it('should select the loadingSelector', () => {
    expect(loadingSelector(state)).toEqual(state.profile.loading)
  })

  it('should select the userProfileSelector', () => {
    expect(userProfileSelector(state)).toEqual(state.profile.userProfile)
  })
})
