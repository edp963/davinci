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

import { call, put, all, takeLatest } from 'redux-saga/effects'

import { GET_USER_PROFILE } from './constants'
import {
  userProfileGot,
  getUserProfileFail
} from './actions'

import request from 'utils/request'
import api from 'utils/api'
import { errorHandler } from 'utils/util'

export function* getUserProfile (action): IterableIterator<any> {
  const { id } = action.payload

  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.user}/profile/${id}`
    })
    const result = asyncData.payload
    yield put(userProfileGot(result))
  } catch (err) {
    yield put(getUserProfileFail())
    errorHandler(err)
  }
}


export default function* rootGroupSaga (): IterableIterator<any> {
  yield all([
    takeLatest(GET_USER_PROFILE, getUserProfile as any)
  ])
}

