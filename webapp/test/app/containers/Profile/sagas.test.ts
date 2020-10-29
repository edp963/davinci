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

import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import request from 'app/utils/request'
import actions from 'app/containers/Profile/actions'
import {
  getUserProfile
} from 'app/containers/Profile/sagas'
import { mockStore } from './fixtures'
import { getMockResponse } from 'test/utils/fixtures'

describe('Profile Sagas', () => {
  const { userId, profile } = mockStore
  describe('getUserProfile Saga', () => {
    const getUserProfileActions = actions.getUserProfile(userId)
    it('should dispatch the userProfileGot action if it requests the data successfully', () => {
      return expectSaga(getUserProfile, getUserProfileActions)
        .provide([[matchers.call.fn(request), getMockResponse(profile)]])
        .put(actions.userProfileGot(profile))
        .run()
    })

    it('should call the getUserProfileFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(getUserProfile, getUserProfileActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.getUserProfileFail())
        .run()
    })
  })

})
