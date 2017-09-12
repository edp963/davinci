/*-
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
  LOAD_DASHBOARDS,
  ADD_DASHBOARD,
  EDIT_DASHBOARD,
  DELETE_DASHBOARD,
  LOAD_DASHBOARD_DETAIL,
  ADD_DASHBOARD_ITEM,
  EDIT_DASHBOARD_ITEM,
  EDIT_DASHBOARD_ITEMS,
  DELETE_DASHBOARD_ITEM,
  LOAD_DASHBOARD_SHARE_LINK,
  LOAD_WIDGET_SHARE_LINK
} from './constants'

import {
  dashboardsLoaded,
  dashboardAdded,
  dashboardEdited,
  dashboardDeleted,
  dashboardDetailLoaded,
  dashboardItemAdded,
  dashboardItemEdited,
  dashboardItemsEdited,
  dashboardItemDeleted,
  dashboardShareLinkLoaded,
  widgetShareLinkLoaded
} from './actions'

import request from '../../utils/request'
import api from '../../utils/api'
import { promiseSagaCreator } from '../../utils/reduxPromisation'
import { writeAdapter, readObjectAdapter, readListAdapter } from '../../utils/asyncAdapter'

export const getDashboards = promiseSagaCreator(
  function* () {
    const asyncData = yield call(request, api.dashboard)
    const dashboards = readListAdapter(asyncData)
    yield put(dashboardsLoaded(dashboards))
    return dashboards
  },
  function (err) {
    console.log('getDashboards', err)
  }
)

export function* getDashboardsWatcher () {
  yield fork(takeLatest, LOAD_DASHBOARDS, getDashboards)
}

export const addDashboard = promiseSagaCreator(
  function* ({ dashboard }) {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.dashboard,
      data: writeAdapter(dashboard)
    })
    const result = readObjectAdapter(asyncData)
    yield put(dashboardAdded(result))
    return result
  },
  function (err) {
    console.log('addDashboard', err)
  }
)

export function* addDashboardWatcher () {
  yield fork(takeEvery, ADD_DASHBOARD, addDashboard)
}

export const editDashboard = promiseSagaCreator(
  function* ({ dashboard }) {
    yield call(request, {
      method: 'put',
      url: api.dashboard,
      data: writeAdapter(dashboard)
    })
    yield put(dashboardEdited(dashboard))
  },
  function (err) {
    console.log('editDashboard', err)
  }
)

export function* editDashboardWatcher () {
  yield fork(takeEvery, EDIT_DASHBOARD, editDashboard)
}

export const deleteDashboard = promiseSagaCreator(
  function* ({ id }) {
    yield call(request, {
      method: 'delete',
      url: `${api.dashboard}/${id}`
    })
    yield put(dashboardDeleted(id))
  },
  function (err) {
    console.log('deleteDashboard', err)
  }
)

export function* deleteDashboardWatcher () {
  yield fork(takeEvery, DELETE_DASHBOARD, deleteDashboard)
}

export const getDashboardDetail = promiseSagaCreator(
  function* ({ id }) {
    const asyncData = yield call(request, `${api.dashboard}/${id}`)
    const dashboard = readListAdapter(asyncData) // FIXME 返回格式不标准
    yield put(dashboardDetailLoaded(dashboard))
    return dashboard
  },
  function (err) {
    console.log('getDashboardDetail', err)
  }
)

export function* getDashboardDetailWatcher () {
  yield fork(takeLatest, LOAD_DASHBOARD_DETAIL, getDashboardDetail)
}

export const addDashboardItem = promiseSagaCreator(
  function* ({ item }) {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.dashboard}/widgets`,
      data: writeAdapter(item)
    })
    const result = readObjectAdapter(asyncData)
    yield put(dashboardItemAdded(result))
    return result
  },
  function (err) {
    console.log('addDashboardItem', err)
  }
)

export function* addDashboardItemWatcher () {
  yield fork(takeEvery, ADD_DASHBOARD_ITEM, addDashboardItem)
}

export function* editDashboardItem ({ payload }) {
  try {
    yield call(request, {
      method: 'put',
      url: `${api.dashboard}/widgets`,
      data: writeAdapter(payload.item)
    })
    yield put(dashboardItemEdited(payload.item))
    payload.resolve()
  } catch (err) {
    console.log('editDashboardItem', err)
  }
}

export function* editDashboardItemWatcher () {
  yield fork(takeEvery, EDIT_DASHBOARD_ITEM, editDashboardItem)
}

export function* editDashboardItems({ payload }) {
  try {
    yield call(request, {
      method: 'put',
      url: `${api.dashboard}/widgets`,
      data: {
        payload: payload.items
      }
    })
    yield put(dashboardItemsEdited(payload.items))
    payload.resolve()
  } catch (err) {
    console.log('editDashboardItems', err)
  }
}

export function* editDashboardItemsWatcher () {
  yield fork(takeEvery, EDIT_DASHBOARD_ITEMS, editDashboardItems)
}

export const deleteDashboardItem = promiseSagaCreator(
  function* ({ id }) {
    yield call(request, {
      method: 'delete',
      url: `${api.dashboard}/widgets/${id}`
    })
    yield put(dashboardItemDeleted(id))
  },
  function (err) {
    console.log('deleteDashboardItem', err)
  }
)

export function* deleteDashboardItemWatcher () {
  yield fork(takeEvery, DELETE_DASHBOARD_ITEM, deleteDashboardItem)
}

export const getDashboardShareLink = promiseSagaCreator(
  function* ({ id }) {
    const asyncData = yield call(request, `${api.share}/dashboard/${id}`)
    const shareInfo = readListAdapter(asyncData)
    yield put(dashboardShareLinkLoaded(shareInfo))
    return shareInfo
  },
  function (err) {
    console.log('getDashboardShareLink', err)
  }
)

export function* getDashboardShareLinkWatcher () {
  yield fork(takeLatest, LOAD_DASHBOARD_SHARE_LINK, getDashboardShareLink)
}

export const getWidgetShareLink = promiseSagaCreator(
  function* ({ id }) {
    const asyncData = yield call(request, `${api.share}/widget/${id}`)
    const shareInfo = readListAdapter(asyncData)
    yield put(widgetShareLinkLoaded(shareInfo))
    return shareInfo
  },
  function (err) {
    console.log('getWidgetShareLink', err)
  }
)

export function* getWidgetShareLinkWatcher () {
  yield fork(takeLatest, LOAD_WIDGET_SHARE_LINK, getWidgetShareLink)
}

export default [
  getDashboardsWatcher,
  addDashboardWatcher,
  editDashboardWatcher,
  deleteDashboardWatcher,
  getDashboardDetailWatcher,
  addDashboardItemWatcher,
  editDashboardItemWatcher,
  editDashboardItemsWatcher,
  deleteDashboardItemWatcher,
  getDashboardShareLinkWatcher,
  getWidgetShareLinkWatcher
]
