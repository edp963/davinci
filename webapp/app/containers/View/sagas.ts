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

import { call, put, all, takeLatest, takeEvery } from 'redux-saga/effects'
import { ActionTypes } from './constants'
import { ViewActions, ViewActionType } from './actions'

import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import request, { IDavinciResponse } from 'utils/request'
import api from 'utils/api'
import { errorHandler } from 'utils/util'

import { IViewBase, IView, IExecuteSqlResponse } from './types'

export function* getViews (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_VIEWS) { return }
  const { payload } = action
  const { viewsLoaded, loadViewsFail } = ViewActions
  let views: IViewBase[]
  try {
    const asyncData = yield call(request, `${api.view}?projectId=${payload.projectId}`)
    views = asyncData.payload
    yield put(viewsLoaded(views))
  } catch (err) {
    yield put(loadViewsFail())
    errorHandler(err)
  } finally {
    if (payload.resolve) {
      payload.resolve(views)
    }
  }
}

export function* getViewDetail (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_VIEW_DETAIL) { return }
  const { payload } = action
  const { viewDetailLoaded, loadViewDetailFail } = ViewActions
  try {
    const asyncData = yield call(request, `${api.view}/${payload.viewId}`)
    const view: IView = asyncData.payload
    yield put(viewDetailLoaded(view))
  } catch (err) {
    yield put(loadViewDetailFail())
    errorHandler(err)
  }
}

export function* addView (action: ViewActionType) {
  if (action.type !== ActionTypes.ADD_VIEW) { return }
  const { payload } = action
  const { viewAdded, addViewFail } = ViewActions
  try {
    const asyncData = yield call<AxiosRequestConfig>(request, {
      method: 'post',
      url: api.view,
      data: payload.view
    })
    yield put(viewAdded(asyncData.payload))
  } catch (err) {
    yield put(addViewFail())
    errorHandler(err)
  }
}

export function* editView (action: ViewActionType) {
  if (action.type !== ActionTypes.EDIT_VIEW) { return }
  const { payload } = action
  const { view, resolve } = payload
  const { viewEdited, editViewFail } = ViewActions
  try {
    yield call<AxiosRequestConfig>(request, {
      method: 'put',
      url: `${api.view}/${view.id}`,
      data: view
    })
    yield put(viewEdited(view))
    resolve()
  } catch (err) {
    yield put(editViewFail())
    errorHandler(err)
  }
}

export function* deleteView (action: ViewActionType) {
  if (action.type !== ActionTypes.DELETE_VIEW) { return }
  const { payload } = action
  const { viewDeleted, deleteViewFail } = ViewActions
  try {
    yield call<AxiosRequestConfig>(request, {
      method: 'delete',
      url: `${api.view}/${payload.id}`
    })
    yield put(viewDeleted(payload.id))
    payload.resolve(payload.id)
  } catch (err) {
    yield put(deleteViewFail())
    errorHandler(err)
  }
}

export function* executeSql (action: ViewActionType) {
  if (action.type !== ActionTypes.EXECUTE_SQL) { return }
  const { params } = action.payload
  const { sqlExecuted, executeSqlFail } = ViewActions
  try {
    const asyncData: IDavinciResponse<IExecuteSqlResponse> = yield call<AxiosRequestConfig>(request, {
      method: 'post',
      url: `${api.view}/executesql`,
      data: params
    })
    yield put(sqlExecuted(asyncData))
  } catch (err) {
    const { response } = err as AxiosError
    const { data } = response as AxiosResponse<IDavinciResponse<any>>
    yield put(executeSqlFail(data.header))
  }

}

/** View sagas for external usages */
export function* getViewData (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_VIEW_DATA) { return }
  const { id, requestParams, resolve } = action.payload
  const { viewDataLoaded, loadViewDataFail } = ViewActions
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.view}/${id}/getdata`,
      data: requestParams
    })
    yield put(viewDataLoaded())
    const { resultList } = asyncData.payload
    asyncData.payload.resultList = (resultList && resultList.slice(0, 500)) || []
    resolve(asyncData.payload)
  } catch (err) {
    yield put(loadViewDataFail(err))
    errorHandler(err)
  }
}

export function* getViewDistinctValue (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_VIEW_DISTINCT_VALUE) { return }
  const { viewId, fieldName, filters, resolve } = action.payload
  const { viewDistinctValueLoaded, loadViewDistinctValueFail } = ViewActions
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.view}/${viewId}/getdistinctvalue`,
      data: {
        columns: [fieldName],
        parents: filters
          ? Object.entries(filters).map(([column, value]) => ({ column, value }))
          : []
      }
    })
    const result = asyncData.payload.map((item) => item[fieldName])
    yield put(viewDistinctValueLoaded(result, fieldName))
    if (resolve) {
      resolve(asyncData.payload)
    }
  } catch (err) {
    yield put(loadViewDistinctValueFail(err))
    errorHandler(err)
  }
}

export function* getViewDataFromVizItem (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM) { return }
  const { renderType, itemId, viewId, requestParams, vizType } = action.payload
  const { viewDataFromVizItemLoaded, loadViewDataFromVizItemFail } = ViewActions
  const {
    filters,
    linkageFilters,
    globalFilters,
    variables,
    linkageVariables,
    globalVariables,
    pagination,
    ...rest
  } = requestParams
  const { pageSize, pageNo } = pagination || { pageSize: 0, pageNo: 0 }

  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.view}/${viewId}/getdata`,
      data: {
        ...rest,
        filters: filters.concat(linkageFilters).concat(globalFilters),
        params: variables.concat(linkageVariables).concat(globalVariables),
        pageSize,
        pageNo
      }
    })
    const { resultList } = asyncData.payload
    asyncData.payload.resultList = (resultList && resultList.slice(0, 500)) || []
    yield put(viewDataFromVizItemLoaded(renderType, itemId, requestParams, asyncData.payload, vizType))
  } catch (err) {
    yield put(loadViewDataFromVizItemFail(itemId, vizType))
    errorHandler(err)
  }
}

/** */

export default function* rootViewSaga () {
  yield all([
    takeLatest(ActionTypes.LOAD_VIEWS, getViews),
    takeEvery(ActionTypes.LOAD_VIEW_DETAIL, getViewDetail),
    takeLatest(ActionTypes.ADD_VIEW, addView),
    takeEvery(ActionTypes.EDIT_VIEW, editView),
    takeEvery(ActionTypes.DELETE_VIEW, deleteView),
    takeLatest(ActionTypes.EXECUTE_SQL, executeSql),

    takeEvery(ActionTypes.LOAD_VIEW_DATA, getViewData),
    takeEvery(ActionTypes.LOAD_VIEW_DISTINCT_VALUE, getViewDistinctValue),
    takeEvery(ActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM, getViewDataFromVizItem)
  ])
}
