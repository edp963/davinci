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

import { takeLatest, takeEvery } from 'redux-saga'
import { call, fork, put } from 'redux-saga/effects'

const message = require('antd/lib/message')
import request from 'utils/request'
import api from 'utils/api'
import { ActionTypes } from './constants'
import { displayLoaded, loadDisplayFail } from './actions'

export function* getDisplay (action) {
  const { token, resolve, reject } = action.payload
  try {
    const asyncData = yield call(request, `${api.share}/display/${token}`)
    const display = asyncData.payload
    const { slides, widgets } = display
    yield put(displayLoaded(display, slides[0], widgets))
    resolve()
  } catch (err) {
    yield put(loadDisplayFail(err))
    reject()
    message.error('获取 Display 信息失败，请刷新重试')
  }
}

export default function* rootDisplaySaga (): IterableIterator<any> {
  yield [
    takeLatest(ActionTypes.LOAD_SHARE_DISPLAY, getDisplay)
  ]
}
