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
  LOAD_DASHBOARDS,
  ADD_DASHBOARD,
  EDIT_DASHBOARD,
  EDIT_CURRENT_DASHBOARD,
  DELETE_DASHBOARD,
  LOAD_DASHBOARD_DETAIL,
  ADD_DASHBOARD_ITEM,
  EDIT_DASHBOARD_ITEM,
  EDIT_DASHBOARD_ITEMS,
  DELETE_DASHBOARD_ITEM,
  LOAD_DASHBOARD_SHARE_LINK,
  LOAD_WIDGET_SHARE_LINK,
  LOAD_WIDGET_CSV,
  UPDAATE_MARK
} from './constants'

import {
  dashboardsLoaded,
  dashboardAdded,
  dashboardEdited,
  editDashboardFail,
  currentDashboardEdited,
  editCurrentDashboardFail,
  dashboardDeleted,
  dashboardDetailLoaded,
  dashboardItemAdded,
  dashboardItemEdited,
  dashboardItemsEdited,
  dashboardItemDeleted,
  dashboardShareLinkLoaded,
  dashboardSecretLinkLoaded,
  widgetSecretLinkLoaded,
  loadDashboardShareLinkFail,
  widgetShareLinkLoaded,
  loadWidgetShareLinkFail,
  widgetCsvLoaded,
  loadWidgetCsvFail,
  updateMarkSuccess,
  updateMarkError
} from './actions'

import message from 'antd/lib/message'
import request from '../../utils/request'
import api from '../../utils/api'
import { promiseSagaCreator } from '../../utils/reduxPromisation'
import { writeAdapter, readObjectAdapter, readListAdapter } from '../../utils/asyncAdapter'
import config, { env } from '../../globalConfig'
const shareHost = config[env].shareHost

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

export function* editDashboard ({ payload }) {
  try {
    yield call(request, {
      method: 'put',
      url: api.dashboard,
      data: writeAdapter(payload.dashboard)
    })
    yield put(dashboardEdited(payload.dashboard))
    payload.resolve()
  } catch (err) {
    yield put(editDashboardFail())
    message.error('修改 Dashboard 失败，请稍后再试')
  }
}

export function* editDashboardWatcher () {
  yield fork(takeEvery, EDIT_DASHBOARD, editDashboard)
}

export function* editCurrentDashboard ({ payload }) {
  try {
    yield call(request, {
      method: 'put',
      url: api.dashboard,
      data: writeAdapter(payload.dashboard)
    })
    yield put(currentDashboardEdited(payload.dashboard))
    payload.resolve()
  } catch (err) {
    yield put(editCurrentDashboardFail())
    message.error('修改当前 Dashboard 内容失败，请稍后再试')
  }
}

export function* editCurrentDashboardWatcher () {
  yield fork(takeEvery, EDIT_CURRENT_DASHBOARD, editCurrentDashboard)
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

export function* editDashboardItems ({ payload }) {
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

export function* getDashboardShareLink ({ payload }) {
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.share}/dashboard/${payload.id}`,
      params: {auth_name: payload.authName}
    })
    const shareInfo = readListAdapter(asyncData)
    if (payload.authName) {
      yield put(dashboardSecretLinkLoaded(shareInfo))
    } else {
      yield put(dashboardShareLinkLoaded(shareInfo))
    }
  } catch (err) {
    yield put(loadDashboardShareLinkFail())
    message.error('获取 Dashboard 分享链接失败，请稍后再试')
  }
}

export function* getDashboardShareLinkWatcher () {
  yield fork(takeLatest, LOAD_DASHBOARD_SHARE_LINK, getDashboardShareLink)
}

export function* getWidgetShareLink ({ payload }) {
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.share}/widget/${payload.id}`,
      params: {auth_name: payload.authName}
    })
    const shareInfo = readListAdapter(asyncData)
    if (payload.authName) {
      yield put(widgetSecretLinkLoaded(shareInfo, payload.itemId))
    } else {
      yield put(widgetShareLinkLoaded(shareInfo, payload.itemId))
    }
  } catch (err) {
    yield put(loadWidgetShareLinkFail(payload.itemId))
    message.error('获取 Widget 分享链接失败，请稍后再试')
  }
}

export function* getWidgetShareLinkWatcher () {
  yield fork(takeLatest, LOAD_WIDGET_SHARE_LINK, getWidgetShareLink)
}

export function* getWidgetCsv ({ payload }) {
  const { token, sql, sorts, offset, limit } = payload
  let queries = ''

  if (offset !== undefined && limit !== undefined) {
    queries = `?sortby=${sorts}&offset=${offset}&limit=${limit}`
  }

  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.share}/csv/${token}${queries}`,
      data: sql || {}
    })
    yield put(widgetCsvLoaded(payload.itemId))
    const path = readListAdapter(asyncData)
    location.href = `${shareHost.substring(0, shareHost.lastIndexOf('/'))}/${path}`
    // location.href = `data:application/octet-stream,${encodeURIComponent(asyncData)}`
  } catch (err) {
    yield put(loadWidgetCsvFail(payload.itemId))
    message.error('获取csv文件失败，请稍后再试')
  }
}

export function* getWidgetCsvWatcher () {
  yield fork(takeLatest, LOAD_WIDGET_CSV, getWidgetCsv)
}

export function* updateMarkRepos ({payload}) {
  const {id, params, resolve, reject} = payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.bizlogic}/${id}/mark`,
      data: {params}
    })
    const result = readListAdapter(asyncData)
    resolve(result)
  } catch (err) {
    reject(err)
  }
}

export function* updateMarkRepoWatcher () {
  yield fork(takeLatest, UPDAATE_MARK, updateMarkRepos)
}

export default [
  getDashboardsWatcher,
  addDashboardWatcher,
  editDashboardWatcher,
  editCurrentDashboardWatcher,
  deleteDashboardWatcher,
  getDashboardDetailWatcher,
  addDashboardItemWatcher,
  editDashboardItemWatcher,
  editDashboardItemsWatcher,
  deleteDashboardItemWatcher,
  getDashboardShareLinkWatcher,
  getWidgetShareLinkWatcher,
  getWidgetCsvWatcher,
  updateMarkRepoWatcher
]
