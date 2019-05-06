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

export default function* rootViewSaga () {
  yield all([
    takeLatest(ActionTypes.LOAD_VIEWS, getViews),
    takeEvery(ActionTypes.LOAD_VIEW_DETAIL, getViewDetail),
    takeLatest(ActionTypes.ADD_VIEW, addView),
    takeEvery(ActionTypes.EDIT_VIEW, editView),
    takeEvery(ActionTypes.DELETE_VIEW, deleteView),
    takeLatest(ActionTypes.EXECUTE_SQL, executeSql)
  ])
}
