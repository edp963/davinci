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
  loadDashboardsFail,
  dashboardAdded,
  addDashboardFail,
  dashboardEdited,
  editDashboardFail,
  currentDashboardEdited,
  editCurrentDashboardFail,
  dashboardDeleted,
  deleteDashboardFail,
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
import { writeAdapter, readObjectAdapter, readListAdapter } from '../../utils/asyncAdapter'
import config, { env } from '../../globalConfig'
const shareHost = config[env].shareHost

export function* getDashboards () {
  try {
    const asyncData = yield call(request, api.dashboard)
    const dashboards = readListAdapter(asyncData)
    yield put(dashboardsLoaded(dashboards))
  } catch (err) {
    yield put(loadDashboardsFail())
    message.error('获取 Dashboards 失败，请稍后再试')
  }
}

export function* addDashboard (action) {
  const { dashboard, resolve } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.dashboard,
      data: writeAdapter(dashboard)
    })
    const result = readObjectAdapter(asyncData)
    yield put(dashboardAdded(result))
    resolve()
  } catch (err) {
    yield put(addDashboardFail())
    message.error('添加 Dashboard 失败，请稍后再试')
  }
}

export function* editDashboard (action) {
  const { dashboard, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: api.dashboard,
      data: writeAdapter(dashboard)
    })
    yield put(dashboardEdited(dashboard))
    resolve()
  } catch (err) {
    yield put(editDashboardFail())
    message.error('修改 Dashboard 失败，请稍后再试')
  }
}

export function* editCurrentDashboard (action) {
  const { dashboard, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: api.dashboard,
      data: writeAdapter(dashboard)
    })
    yield put(currentDashboardEdited(dashboard))
    resolve()
  } catch (err) {
    yield put(editCurrentDashboardFail())
    message.error('修改当前 Dashboard 内容失败，请稍后再试')
  }
}

export function* deleteDashboard (action) {
  const { id } = action.payload
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.dashboard}/${id}`
    })
    yield put(dashboardDeleted(id))
  } catch (err) {
    yield put(deleteDashboardFail())
    message.error('删除当前 Dashboard 失败，请稍后再试')
  }
}

export function* getDashboardDetail ({ payload }) {
  try {
    const asyncData = yield call(request, `${api.dashboard}/${payload.id}`)
    const dashboard = readListAdapter(asyncData) // FIXME 返回格式不标准
    yield put(dashboardDetailLoaded(dashboard))
    return dashboard
  } catch (err) {
    console.log('getDashboardDetail', err)
  }
}

export function* addDashboardItem ({ payload }) {
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.dashboard}/widgets`,
      data: writeAdapter(payload.item)
    })
    const result = readObjectAdapter(asyncData)
    yield put(dashboardItemAdded(result))
    return result
  } catch (err) {
    console.log('addDashboardItem', err)
  }
}

export function* editDashboardItem (action) {
  const { item, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.dashboard}/widgets`,
      data: writeAdapter(item)
    })
    yield put(dashboardItemEdited(item))
    resolve()
  } catch (err) {
    console.log('editDashboardItem', err)
  }
}

export function* editDashboardItems (action) {
  const { items, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.dashboard}/widgets`,
      data: {
        payload: items
      }
    })
    yield put(dashboardItemsEdited(items))
    resolve()
  } catch (err) {
    console.log('editDashboardItems', err)
  }
}

export function* deleteDashboardItem ({ payload }) {
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.dashboard}/widgets/${payload.id}`
    })
    yield put(dashboardItemDeleted(payload.id))
  } catch (err) {
    console.log('deleteDashboardItem', err)
  }
}

export function* getDashboardShareLink (action) {
  const { id, authName } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.share}/dashboard/${id}`,
      params: {auth_name: authName}
    })
    const shareInfo = readListAdapter(asyncData)
    if (authName) {
      yield put(dashboardSecretLinkLoaded(shareInfo))
    } else {
      yield put(dashboardShareLinkLoaded(shareInfo))
    }
  } catch (err) {
    yield put(loadDashboardShareLinkFail())
    message.error('获取 Dashboard 分享链接失败，请稍后再试')
  }
}

export function* getWidgetShareLink (action) {
  const { id, authName, itemId } = action.payload
  try {
    const asyncData = yield call(request, {
      method: 'get',
      url: `${api.share}/widget/${id}`,
      params: {auth_name: authName}
    })
    const shareInfo = readListAdapter(asyncData)
    if (authName) {
      yield put(widgetSecretLinkLoaded(shareInfo, itemId))
    } else {
      yield put(widgetShareLinkLoaded(shareInfo, itemId))
    }
  } catch (err) {
    yield put(loadWidgetShareLinkFail(itemId))
    message.error('获取 Widget 分享链接失败，请稍后再试')
  }
}

export function* getWidgetCsv (action) {
  const { token, sql, sorts, offset, limit, itemId } = action.payload
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
    yield put(widgetCsvLoaded(itemId))
    const path = readListAdapter(asyncData)
    location.href = `${shareHost.substring(0, shareHost.lastIndexOf('/'))}/${path}`
    // location.href = `data:application/octet-stream,${encodeURIComponent(asyncData)}`
  } catch (err) {
    yield put(loadWidgetCsvFail(itemId))
    message.error('获取csv文件失败，请稍后再试')
  }
}

export function* updateMarkRepos (action) {
  const {id, params, resolve, reject} = action.payload
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

export default function* rootDashboardSaga (): IterableIterator<any> {
  yield [
    takeLatest(LOAD_DASHBOARDS, getDashboards),
    takeEvery(ADD_DASHBOARD, addDashboard),
    takeEvery(EDIT_DASHBOARD, editDashboard),
    takeEvery(EDIT_CURRENT_DASHBOARD, editCurrentDashboard),
    takeEvery(DELETE_DASHBOARD, deleteDashboard),
    takeLatest(LOAD_DASHBOARD_DETAIL, getDashboardDetail as any),
    takeEvery(ADD_DASHBOARD_ITEM, addDashboardItem as any),
    takeEvery(EDIT_DASHBOARD_ITEM, editDashboardItem),
    takeEvery(EDIT_DASHBOARD_ITEMS, editDashboardItems),
    takeEvery(DELETE_DASHBOARD_ITEM, deleteDashboardItem as any),
    takeLatest(LOAD_DASHBOARD_SHARE_LINK, getDashboardShareLink),
    takeLatest(LOAD_WIDGET_SHARE_LINK, getWidgetShareLink),
    takeLatest(LOAD_WIDGET_CSV, getWidgetCsv),
    takeLatest(UPDAATE_MARK, updateMarkRepos)
  ]
}
