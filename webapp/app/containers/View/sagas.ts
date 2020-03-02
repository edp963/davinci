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
import omit from 'lodash/omit'

import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import request, { IDavinciResponse } from 'utils/request'
import api from 'utils/api'
import { errorHandler, getErrorMessage } from 'utils/util'

import { IViewBase, IView, IExecuteSqlResponse, IExecuteSqlParams, IViewVariable } from './types'
import { IDistinctValueReqeustParams } from 'app/components/Filters/types'

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

export function* getViewsDetail (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_VIEWS_DETAIL) { return }
  const { payload } = action
  const { viewsDetailLoaded, loadViewsDetailFail } = ViewActions
  const { viewIds, resolve, isEditing } = payload
  try {
    // @FIXME make it be a single request
    const asyncData = yield all(viewIds.map((viewId) => (call(request, `${api.view}/${viewId}`))))
    const views: IView[] = asyncData.map((item) => item.payload)
    yield put(viewsDetailLoaded(views, isEditing))
    if (resolve) { resolve() }
  } catch (err) {
    yield put(loadViewsDetailFail())
    errorHandler(err)
  }
}

export function* addView (action: ViewActionType) {
  if (action.type !== ActionTypes.ADD_VIEW) { return }
  const { payload } = action
  const { view, resolve } = payload
  const { viewAdded, addViewFail } = ViewActions
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: api.view,
      data: view
    })
    yield put(viewAdded(asyncData.payload))
    resolve()
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
    yield call(request, {
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
    yield call(request, {
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

export function* copyView (action: ViewActionType) {
  if (action.type !== ActionTypes.COPY_VIEW) { return }
  const { view, resolve } = action.payload
  const { viewCopied, copyViewFail } = ViewActions
  try {
    const fromViewResponse = yield call(request, `${api.view}/${view.id}`)
    const fromView = fromViewResponse.payload
    const copyView: IView = { ...fromView, name: view.name, description: view.description }
    const asyncData = yield call(request, {
      method: 'post',
      url: api.view,
      data: copyView
    })
    yield put(viewCopied(fromView.id, asyncData.payload))
    resolve()
  } catch (err) {
    yield put(copyViewFail())
    errorHandler(err)
  }
}

export function* executeSql (action: ViewActionType) {
  if (action.type !== ActionTypes.EXECUTE_SQL) { return }
  const { params } = action.payload
  const { variables, ...rest } = params
  const omitKeys: Array<keyof IViewVariable> = ['key', 'alias', 'fromService']
  const variableParam = variables.map((v) => omit(v, omitKeys))
  const { sqlExecuted, executeSqlFail } = ViewActions
  try {
    const asyncData: IDavinciResponse<IExecuteSqlResponse> = yield call(request, {
      method: 'post',
      url: `${api.view}/executesql`,
      data: {
        ...rest,
        variables: variableParam
      }
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
  const { id, requestParams, resolve, reject } = action.payload
  const { viewDataLoaded, loadViewDataFail } = ViewActions
  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.view}/${id}/getdata`,
      data: requestParams
    })
    yield put(viewDataLoaded())
    const { resultList } = asyncData.payload
    asyncData.payload.resultList = (resultList && resultList.slice(0, 600)) || []
    resolve(asyncData.payload)
  } catch (err) {
    const { response } = err as AxiosError
    const { data } = response as AxiosResponse<IDavinciResponse<any>>
    yield put(loadViewDataFail(err))
    reject(data.header)
  }
}

export function* getSelectOptions (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_SELECT_OPTIONS) { return }
  const { payload } = action
  const { selectOptionsLoaded, loadSelectOptionsFail } = ViewActions
  try {
    const { controlKey, requestParams, itemId, cancelTokenSource } = payload
    const requestParamsMap: Array<[string, IDistinctValueReqeustParams]> = Object.entries(requestParams)
    const requests = requestParamsMap.map(([viewId, params]: [string, IDistinctValueReqeustParams]) => {
      const { columns, filters, variables, cache, expired } = params
      return call(request, {
        method: 'post',
        url: `${api.bizlogic}/${viewId}/getdistinctvalue`,
        data: {
          columns,
          filters,
          params: variables,
          cache,
          expired
        },
        cancelToken: cancelTokenSource.token
      })
    })
    const results = yield all(requests)
    const values = results.reduce((payloads, r, index) => {
      const { columns } = requestParamsMap[index][1]
      if (columns.length === 1) {
        return payloads.concat(r.payload.map((obj) => obj[columns[0]]))
      }
      return payloads
    }, [])
    yield put(selectOptionsLoaded(controlKey, Array.from(new Set(values)), itemId))
  } catch (err) {
    yield put(loadSelectOptionsFail(err))
    // errorHandler(err)
  }
}

export function* getViewDistinctValue (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_VIEW_DISTINCT_VALUE) { return }
  const { viewId, params, resolve } = action.payload
  const { viewDistinctValueLoaded, loadViewDistinctValueFail } = ViewActions
  try {
    const result = yield call(request, {
      method: 'post',
      url: `${api.view}/${viewId}/getdistinctvalue`,
      data: {
        cache: false,
        expired: 0,
        ...params
      }
    })
    const list = params.columns.reduce((arr, col) => {
      return arr.concat(result.payload.map((item) => item[col]))
    }, [])
    yield put(viewDistinctValueLoaded(Array.from(new Set(list))))
    if (resolve) {
      resolve(result.payload)
    }
  } catch (err) {
    yield put(loadViewDistinctValueFail(err))
    errorHandler(err)
  }
}

export function* getViewDataFromVizItem (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM) { return }
  const { renderType, itemId, viewId, requestParams, vizType, cancelTokenSource } = action.payload
  const { viewDataFromVizItemLoaded, loadViewDataFromVizItemFail } = ViewActions
  const {
    filters,
    tempFilters,
    linkageFilters,
    globalFilters,
    variables,
    linkageVariables,
    globalVariables,
    pagination,
    drillStatus,
    groups,
    ...rest
  } = requestParams
  const { pageSize, pageNo } = pagination || { pageSize: 0, pageNo: 0 }

  let searchFilters = filters.concat(tempFilters).concat(linkageFilters).concat(globalFilters)
  if (drillStatus && drillStatus.filter) {
    searchFilters = searchFilters.concat( drillStatus.filter.sqls)
  }

  try {
    const asyncData = yield call(request, {
      method: 'post',
      url: `${api.view}/${viewId}/getdata`,
      data: {
        ...omit(rest, 'customOrders'),
        groups:  drillStatus && drillStatus.groups ? drillStatus.groups : groups,
        filters: searchFilters,
        params: variables.concat(linkageVariables).concat(globalVariables),
        pageSize,
        pageNo
      },
      cancelToken: cancelTokenSource.token
    })
    const { resultList } = asyncData.payload
    asyncData.payload.resultList = (resultList && resultList.slice(0, 600)) || []
    yield put(viewDataFromVizItemLoaded(renderType, itemId, requestParams, asyncData.payload, vizType, action.statistic))
  } catch (err) {
    yield put(loadViewDataFromVizItemFail(itemId, vizType, getErrorMessage(err)))
  }
}
/** */

/** View sagas for fetch external authorization variables values */
export function* getDacChannels (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_DAC_CHANNELS) { return }
  const { dacChannelsLoaded, loadDacChannelsFail } = ViewActions
  try {
    const asyncData = yield call(request, `${api.view}/dac/channels`)
    const channels = asyncData.payload
    yield put(dacChannelsLoaded(channels))
  } catch (err) {
    yield put(loadDacChannelsFail())
    errorHandler(err)
  }
}
export function* getDacTenants (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_DAC_TENANTS) { return }
  const { dacTenantsLoaded, loadDacTenantsFail } = ViewActions
  const { channelName } = action.payload
  try {
    const asyncData = yield call(request, `${api.view}/dac/${channelName}/tenants`)
    const tenants = asyncData.payload
    yield put(dacTenantsLoaded(tenants))
  } catch (err) {
    yield put(loadDacTenantsFail())
    errorHandler(err)
  }
}
export function* getDacBizs (action: ViewActionType) {
  if (action.type !== ActionTypes.LOAD_DAC_BIZS) { return }
  const { dacBizsLoaded, loadDacBizsFail } = ViewActions
  const { channelName, tenantId } = action.payload
  try {
    const asyncData = yield call(request, `${api.view}/dac/${channelName}/tenants/${tenantId}/bizs`)
    const bizs = asyncData.payload
    yield put(dacBizsLoaded(bizs))
  } catch (err) {
    yield put(loadDacBizsFail())
    errorHandler(err)
  }
}
/** */

export default function* rootViewSaga () {
  yield all([
    takeLatest(ActionTypes.LOAD_VIEWS, getViews),
    takeEvery(ActionTypes.LOAD_VIEWS_DETAIL, getViewsDetail),
    takeLatest(ActionTypes.ADD_VIEW, addView),
    takeEvery(ActionTypes.EDIT_VIEW, editView),
    takeEvery(ActionTypes.DELETE_VIEW, deleteView),
    takeEvery(ActionTypes.COPY_VIEW, copyView),
    takeLatest(ActionTypes.EXECUTE_SQL, executeSql),

    takeEvery(ActionTypes.LOAD_VIEW_DATA, getViewData),
    takeEvery(ActionTypes.LOAD_SELECT_OPTIONS, getSelectOptions),
    takeEvery(ActionTypes.LOAD_VIEW_DISTINCT_VALUE, getViewDistinctValue),
    takeEvery(ActionTypes.LOAD_VIEW_DATA_FROM_VIZ_ITEM, getViewDataFromVizItem),

    takeEvery(ActionTypes.LOAD_DAC_CHANNELS, getDacChannels),
    takeEvery(ActionTypes.LOAD_DAC_TENANTS, getDacTenants),
    takeEvery(ActionTypes.LOAD_DAC_BIZS, getDacBizs)
  ])
}
