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
import { call, put } from 'redux-saga/effects'
import {
  LOAD_WIDGETS,
  ADD_WIDGET,
  DELETE_WIDGET,
  // LOAD_WIDGET_DETAIL,
  EDIT_WIDGET
} from './constants'

import {
  widgetsLoaded,
  widgetsLoadedFail,
  widgetAdded,
  addWidgetFail,
  widgetDeleted,
  deleteWidgetFail,
  // widgetDetailLoaded,
  widgetEdited,
  editWidgetFail
} from './actions'

const message = require('antd/lib/message')
import request from '../../utils/request'
import api from '../../utils/api'
import { writeAdapter, readObjectAdapter, readListAdapter } from '../../utils/asyncAdapter'

export function* getWidgets (action) {
  const { projectId } = action.payload
  try {
    const asyncData = yield call(request, `${api.widget}?projectId=${projectId}`)
    const widgets = readListAdapter(asyncData)
    yield put(widgetsLoaded(widgets))
  } catch (err) {
    yield put(widgetsLoadedFail())
    message.error('加载 Widget 列表失败')
  }
}

export function* addWidget ({ payload }) {
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.widget,
      data: writeAdapter(payload.widget)
    })

    const result = readObjectAdapter(asyncData)
    yield put(widgetAdded(result))
    payload.resolve()
  } catch (err) {
    yield put(addWidgetFail())
    message.error('新增失败')
  }
}

export function* deleteWidget ({ payload }) {
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.widget}/${payload.id}`
    })
    yield put(widgetDeleted(payload.id))
  } catch (err) {
    yield put(deleteWidgetFail())
    message.error('删除失败')
  }
}

// export const getWidgetDetail = promiseSagaCreator(
//   function* (payload) {
//     const widget = yield call(request, `${api.widget}/${payload.id}`)
//     yield put(widgetDetailLoaded(widget))
//     return widget
//   },
//   function (err) {
//     console.log('getWidgetDetail', err)
//   }
// )

export function* editWidget ({ payload }) {
  try {
    yield call(request, {
      method: 'put',
      url: api.widget,
      data: writeAdapter(payload.widget)
    })
    yield put(widgetEdited(payload.widget))
    payload.resolve()
  } catch (err) {
    yield put(editWidgetFail())
    message.error('修改失败')
  }
}

export default function* rootWidgetSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_WIDGETS, getWidgets as any),
    takeEvery(ADD_WIDGET, addWidget as any),
    takeEvery(DELETE_WIDGET, deleteWidget as any),
    // takeLatest(LOAD_WIDGET_DETAIL, getWidgetDetail),
    takeEvery(EDIT_WIDGET, editWidget as any)
  ]
}
