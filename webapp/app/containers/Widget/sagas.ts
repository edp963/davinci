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
import {
  LOAD_WIDGETS,
  ADD_WIDGET,
  DELETE_WIDGET,
  LOAD_WIDGET_DETAIL,
  EDIT_WIDGET
} from './constants'
import {
  LOAD_BIZLOGICS,
  LOAD_BIZDATAS
} from '../Bizlogic/constants'
import {
  widgetsLoaded,
  widgetAdded,
  widgetDeleted,
  widgetDetailLoaded,
  widgetEdited,
  bizlogicsLoaded,
  bizdatasLoaded,
  loadBizdatasFail
} from './actions'

import request from '../../utils/request'
import api from '../../utils/api'
import { promiseSagaCreator } from '../../utils/reduxPromisation'
import { writeAdapter, readObjectAdapter, readListAdapter } from '../../utils/asyncAdapter'
import resultsetConverter from '../../utils/resultsetConverter'


export const getWidgets = promiseSagaCreator(
  function* () {
    const asyncData = yield call(request, api.widget)
    const widgets = readListAdapter(asyncData)
    yield put(widgetsLoaded(widgets))
    return widgets
  },
  function (err) {
    console.log('getWidgets', err)
  }
)

export const addWidget = promiseSagaCreator(
  function* ({ widget }) {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.widget,
      data: writeAdapter(widget)
    })
    const result = readObjectAdapter(asyncData)
    yield put(widgetAdded(result))
    return result
  },
  function (err) {
    console.log('addWidget', err)
  }
)

export const deleteWidget = promiseSagaCreator(
  function* ({ id }) {
    yield call(request, {
      method: 'delete',
      url: `${api.widget}/${id}`
    })
    yield put(widgetDeleted(id))
  },
  function (err) {
    console.log('deleteWidget', err)
  }
)

export const getWidgetDetail = promiseSagaCreator(
  function* (payload) {
    const widget = yield call(request, `${api.widget}/${payload.id}`)
    yield put(widgetDetailLoaded(widget))
    return widget
  },
  function (err) {
    console.log('getWidgetDetail', err)
  }
)

export const editWidget = promiseSagaCreator(
  function* ({ widget }) {
    yield call(request, {
      method: 'put',
      url: api.widget,
      data: writeAdapter(widget)
    })
    yield put(widgetEdited(widget))
  },
  function (err) {
    console.log('editWidget', err)
  }
)

// bizlogics
export const getBizlogics = promiseSagaCreator(
  function* () {
    const asyncData = yield call(request, api.bizlogic)
    const bizlogics = readListAdapter(asyncData)
    yield put(bizlogicsLoaded(bizlogics))
    return bizlogics
  },
  function (err) {
    console.log('getBizlogics', err)
  }
)

export function* getBizdatas ({ payload }) {
  try {
    const { id, sql, sorts, offset, limit } = payload

    let queries: string[] | string = []

    if (offset !== undefined && limit !== undefined) {
      queries = queries
        .concat(`sortby=${sorts}`)
        .concat(`offset=${offset}`)
        .concat(`limit=${limit}`)
    }
    queries = queries.concat('usecache=false').concat('expired=0')
    queries = `?${queries.join('&')}`

    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/${id}/resultset${queries}`,
      data: sql || {}
    })
    const bizdatas = resultsetConverter(readListAdapter(asyncData))
    yield put(bizdatasLoaded(bizdatas))
  } catch (err) {
    yield put(loadBizdatasFail(err))
  }
}

export default function* rootWidgetSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_WIDGETS, getWidgets),
    takeEvery(ADD_WIDGET, addWidget),
    takeEvery(DELETE_WIDGET, deleteWidget),
    takeLatest(LOAD_WIDGET_DETAIL, getWidgetDetail),
    takeEvery(EDIT_WIDGET, editWidget),
    takeLatest(LOAD_BIZLOGICS, getBizlogics),
    takeEvery(LOAD_BIZDATAS, getBizdatas as any)
  ]
}
