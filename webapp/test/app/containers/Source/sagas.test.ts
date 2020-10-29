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
import actions from 'app/containers/Source/actions'
import { getSources } from 'app/containers/Source/sagas'
import { mockProjectId, mockSource } from './fixtures'
import { getMockResponse } from 'test/utils/fixtures'

describe('Source Sagas', () => {
  describe('getSources Saga', () => {
    it('should dispatch the sourcesLoaded action if it requests the data successfully', () => {
      return expectSaga(getSources, actions.loadSources(mockProjectId))
        .provide([[matchers.call.fn(request), getMockResponse([mockSource])]])
        .put(actions.sourcesLoaded([mockSource]))
        .run()
    })

    it('should call the loadSourcesFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(getSources, actions.loadSources(mockProjectId))
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.loadSourcesFail())
        .run()
    })
  })

})
