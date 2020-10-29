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

import { ActionTypes } from 'app/containers/Source/constants'
import actions from 'app/containers/Source/actions'
import { mockProjectId, mockSource } from './fixtures'

describe('Source Actions', () => {
  describe('loadSources', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_SOURCES,
        payload: {
          projectId: mockProjectId
        }
      }
      expect(actions.loadSources(mockProjectId)).toEqual(expectedResult)
    })
  })

  describe('sourcesLoaded', () => {
    it('should return the correct type and passed sources', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_SOURCES_SUCCESS,
        payload: {
          sources: [mockSource]
        }
      }
      expect(actions.sourcesLoaded([mockSource])).toEqual(expectedResult)
    })
  })

  describe('loadSourcesFail', () => {
    it('should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_SOURCES_FAILURE
      }
      expect(actions.loadSourcesFail()).toEqual(expectedResult)
    })
  })
})
