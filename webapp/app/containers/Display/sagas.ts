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

import request from '../../utils/request'
import api from '../../utils/api'
import { writeAdapter, readObjectAdapter, readListAdapter } from '../../utils/asyncAdapter'

const message = require('antd/lib/message')

import {
  ActionTypes
} from './constants'
import {
  loadDisplays,
  displaysLoaded,
  loadDisplaysFail,

  loadDisplayDetail,
  displayDetailLoaded,

  addDisplay,
  displayAdded,

  displayEdited,
  editDisplayFail,

  deleteDisplay,
  displayDeleted
} from './actions'
import messages from './messages'

export function* getDisplays (): IterableIterator<any> {
  const asyncData = yield call(request, api.display)
  if (!asyncData.error) {
    const displays = readListAdapter(asyncData)
    yield put(displaysLoaded(displays))
  } else {
    yield put(loadDisplaysFail(asyncData.error))
  }
}

export function* getDisplayDetail (id): IterableIterator<any> {
  const asyncData = yield call(request, `${api.display}/${id}`)
  const display = readListAdapter(asyncData)
  yield put(displayDetailLoaded(display))
  return display
}

export function* editDisplay (display): IterableIterator<any> {
  try {
    yield call(request, {
      method: 'put',
      url: api.display,
      data: writeAdapter(display)
    })
    yield put(displayEdited(display))
  } catch (err) {
    yield put(editDisplayFail(err))
    message.error(err)
  }
}

export default function* rootDisplaySaga (): IterableIterator<any> {
  yield [
    takeLatest(ActionTypes.LOAD_DISPLAYS, getDisplays),
    takeLatest(ActionTypes.LOAD_DISPLAY_DETAIL, getDisplayDetail),
    takeEvery(ActionTypes.EDIT_DISPLAY, editDisplay)
  ]
}
