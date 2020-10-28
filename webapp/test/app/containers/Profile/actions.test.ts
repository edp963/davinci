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
  GET_USER_PROFILE,
  GET_USER_PROFILE_FAILURE,
  GET_USER_PROFILE_SUCCESS
} from 'app/containers/Profile/constants'
import actions from 'app/containers/Profile/actions'
import { mockStore } from './fixtures'

describe('Profile Actions', () => {
  const { userId, profile } = mockStore
  describe('getUserProfile', () => {
    it('getUserProfile should return the correct type', () => {
      const expectedResult = {
        type: GET_USER_PROFILE,
        payload: {
          id: userId
        }
      }
      expect(actions.getUserProfile(userId)).toEqual(expectedResult)
    })
  })
  describe('userProfileGot', () => {
    it('userProfileGot should return the correct type', () => {
      const expectedResult = {
        type: GET_USER_PROFILE_SUCCESS,
        payload: {
          result: profile
        }
      }
      expect(actions.userProfileGot(profile)).toEqual(expectedResult)
    })
  })
  describe('getUserProfileFail', () => {
    it('getUserProfileFail should return the correct type', () => {
      const expectedResult = {
        type: GET_USER_PROFILE_FAILURE
      }
      expect(actions.getUserProfileFail()).toEqual(expectedResult)
    })
  })
})
