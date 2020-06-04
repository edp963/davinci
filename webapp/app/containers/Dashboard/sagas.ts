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

import { call, all, put, takeLatest, takeEvery } from 'redux-saga/effects'

import {
  LOAD_DASHBOARD_DETAIL,
  ADD_DASHBOARD_ITEMS,
  EDIT_DASHBOARD_ITEM,
  EDIT_DASHBOARD_ITEMS,
  DELETE_DASHBOARD_ITEM,
  LOAD_DASHBOARD_SHARE_LINK,
  LOAD_WIDGET_SHARE_LINK,
  LOAD_WIDGET_CSV
} from './constants'

import {
  dashboardDetailLoaded,
  loadDashboardDetailFail,
  dashboardItemsAdded,
  addDashboardItemsFail,
  dashboardItemEdited,
  editDashboardItemFail,
  dashboardItemsEdited,
  editDashboardItemsFail,
  dashboardItemDeleted,
  deleteDashboardItemFail,
  dashboardShareLinkLoaded,
  dashboardSecretLinkLoaded,
  widgetSecretLinkLoaded,
  loadDashboardShareLinkFail,
  widgetShareLinkLoaded,
  loadWidgetShareLinkFail,
  widgetCsvLoaded,
  loadWidgetCsvFail
} from './actions'

import request from 'utils/request'
import { errorHandler } from 'utils/util'
import api from 'utils/api'

export function* getDashboardDetail (action) {
  const { payload } = action
  const { projectId, portalId, dashboardId } = payload

  try {
    const result = yield all({
      dashboardDetail: call(request, `${api.portal}/${portalId}/dashboards/${dashboardId}`),
      widgets: call(request, `${api.widget}?projectId=${projectId}`)
    })
    const views = result.dashboardDetail.payload.views
    delete result.dashboardDetail.payload.views
    yield put(dashboardDetailLoaded(dashboardId, result.dashboardDetail.payload, result.widgets.payload, views))
  } catch (err) {
    yield put(loadDashboardDetailFail())
    errorHandler(err)
  }
}

export function* addDashboardItems (action) {
  const { portalId, items, resolve } = action.payload

  try {
    const result = yield call(request, {
      method: 'post',
      url: `${api.portal}/${portalId}/dashboards/${items[0].dashboardId}/widgets`,
      data: items
    })
    yield put(dashboardItemsAdded(result.payload))
    resolve(result.payload)
  } catch (err) {
    yield put(addDashboardItemsFail())
    errorHandler(err)
  }
}

export function* editDashboardItem (action) {
  const { portalId, item, resolve } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.portal}/${portalId}/dashboards/widgets`,
      data: [item]
    })
    yield put(dashboardItemEdited(item))
    resolve()
  } catch (err) {
    yield put(editDashboardItemFail())
    errorHandler(err)
  }
}

export function* editDashboardItems (action) {
  const { portalId, items } = action.payload
  try {
    yield call(request, {
      method: 'put',
      url: `${api.portal}/${portalId}/dashboards/widgets`,
      data: items
    })
    yield put(dashboardItemsEdited(items))
  } catch (err) {
    yield put(editDashboardItemsFail())
    errorHandler(err)
  }
}

export function* deleteDashboardItem (action) {
  const { id, resolve } = action.payload
  try {
    yield call(request, {
      method: 'delete',
      url: `${api.portal}/dashboards/widgets/${id}`
    })
    yield put(dashboardItemDeleted(id))
    if (resolve) {
      resolve()
    }
  } catch (err) {
    yield put(deleteDashboardItemFail())
    errorHandler(err)
  }
}

export function* getDashboardShareLink (action) {
  const { id, authName } = action.payload
  try {
    const shareInfo = yield call(request, {
      method: 'get',
      url: `${api.portal}/dashboards/${id}/share`,
      params: {username: authName}
    })
    if (authName) {
      yield put(dashboardSecretLinkLoaded(shareInfo.payload))
    } else {
      yield put(dashboardShareLinkLoaded(shareInfo.payload))
    }
  } catch (err) {
    yield put(loadDashboardShareLinkFail())
    errorHandler(err)
  }
}

export function* getWidgetShareLink (action) {
  const { id, authName, itemId, resolve } = action.payload
  try {
    const shareInfo = yield call(request, {
      method: 'get',
      url: `${api.widget}/${id}/share`,
      params: {username: authName}
    })
    if (authName) {
      yield put(widgetSecretLinkLoaded(shareInfo.payload, itemId))
    } else {
      yield put(widgetShareLinkLoaded(shareInfo.payload, itemId))
    }
    if (resolve) {
      resolve()
    }
  } catch (err) {
    yield put(loadWidgetShareLinkFail(itemId))
    errorHandler(err)
  }
}

export function* getWidgetCsv (action) {
  const { itemId, widgetId, requestParams } = action.payload
  const { filters, tempFilters, linkageFilters, globalFilters, variables, linkageVariables, globalVariables, ...rest } = requestParams

  try {
    const path = yield call(request, {
      method: 'post',
      url: `${api.widget}/${widgetId}/excel`,
      data: {
        ...rest,
        filters: filters.concat(tempFilters).concat(linkageFilters).concat(globalFilters),
        params: variables.concat(linkageVariables).concat(globalVariables)
      }
    })
    yield put(widgetCsvLoaded(itemId))
    location.href = path.payload
    // location.href = `data:application/octet-stream,${encodeURIComponent(asyncData)}`
  } catch (err) {
    yield put(loadWidgetCsvFail(itemId))
    errorHandler(err)
  }
}

export default function* rootDashboardSaga (): IterableIterator<any> {
  yield all([
    takeLatest(LOAD_DASHBOARD_DETAIL, getDashboardDetail),
    takeEvery(ADD_DASHBOARD_ITEMS, addDashboardItems),
    takeEvery(EDIT_DASHBOARD_ITEM, editDashboardItem),
    takeEvery(EDIT_DASHBOARD_ITEMS, editDashboardItems),
    takeEvery(DELETE_DASHBOARD_ITEM, deleteDashboardItem),
    takeLatest(LOAD_DASHBOARD_SHARE_LINK, getDashboardShareLink),
    takeLatest(LOAD_WIDGET_SHARE_LINK, getWidgetShareLink),
    takeLatest(LOAD_WIDGET_CSV, getWidgetCsv)
  ])
}
