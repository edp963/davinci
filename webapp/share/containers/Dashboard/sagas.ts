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

import {
  call,
  put,
  all,
  fork,
  select,
  takeLatest,
  takeEvery
} from 'redux-saga/effects'
import { ActionTypes } from './constants'
import { DashboardActions, DashboardActionType } from './actions'
import {
  makeSelectDashboard,
  makeSelectWidgets,
  makeSelectItemRelatedWidget,
  makeSelectItemInfo
} from './selectors'
import {
  makeSelectGlobalControlPanelFormValues,
  makeSelectLocalControlPanelFormValues
} from 'app/containers/ControlPanel/selectors'
import { ControlPanelTypes } from 'app/components/Control/constants'
import {
  globalControlMigrationRecorder,
  localControlMigrationRecorder
} from 'app/utils/migrationRecorders'
import {
  getRequestParams,
  getRequestBody,
  getUpdatedPagination,
  getCurrentControlValues,
  getInitialPagination
} from 'app/containers/Dashboard/util'
import {
  IShareDashboardDetailRaw,
  IShareWidgetRaw,
  IShareDashboardItemInfo,
} from './types'
import {
  IDashboardConfig,
  IDashboard,
  IQueryConditions
} from 'app/containers/Dashboard/types'
import { IWidgetFormed } from 'app/containers/Widget/types'
import {
  IDistinctValueReqeustParams,
  GlobalControlQueryMode,
  IGlobalControlConditions,
  IGlobalControlConditionsByItem,
  ILocalControlConditions
} from 'app/components/Control/types'
import {
  IWidgetConfig,
  RenderType
} from 'app/containers/Widget/components/Widget'

import request, { IDavinciResponse } from 'utils/request'
import { errorHandler, getErrorMessage } from 'utils/util'
import api from 'utils/api'
import { message } from 'antd'
import { DownloadTypes } from 'app/containers/App/constants'

export function* getDashboard(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_SHARE_DASHBOARD) {
    return
  }
  const { dashboardGetted, loadDashboardFail } = DashboardActions
  const { token, reject } = action.payload
  try {
    const result = yield call(request, `${api.share}/dashboard/${token}`)
    const {
      widgets,
      relations,
      config,
      ...rest
    } = result.payload as IShareDashboardDetailRaw
    const parsedConfig: IDashboardConfig = JSON.parse(config || '{}')
    const filters = (parsedConfig.filters || []).map((c) =>
      globalControlMigrationRecorder(c)
    )
    const linkages = parsedConfig.linkages || []
    const queryMode =
      parsedConfig.queryMode || GlobalControlQueryMode.Immediately
    const dashboard = {
      ...rest,
      config: {
        filters,
        linkages,
        queryMode
      }
    }
    const formedWidgets = widgets.map((widget) => {
      const { model, variable, config, ...rest } = widget
      const parsedConfig: IWidgetConfig = JSON.parse(config)
      parsedConfig.controls = parsedConfig.controls.map((c) =>
        localControlMigrationRecorder(c)
      )
      return {
        ...rest,
        config: parsedConfig
      }
    })
    const formedViews = widgets.reduce(
      (obj, widget) => ({
        ...obj,
        [widget.viewId]: { model: JSON.parse(widget.model) }
      }),
      {}
    )
    yield put(dashboardGetted(dashboard, relations, formedWidgets, formedViews))
  } catch (err) {
    yield put(loadDashboardFail())
    errorHandler(err)
    reject(err)
  }
}

export function* getWidget(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_SHARE_WIDGET) {
    return
  }
  const { widgetGetted } = DashboardActions
  const { token, resolve, reject } = action.payload
  try {
    const result = yield call(request, `${api.share}/widget/${token}`)
    const widget: IShareWidgetRaw = result.payload
    const { model, variable, config, ...rest } = widget
    const parsedConfig: IWidgetConfig = JSON.parse(config)
    parsedConfig.controls = parsedConfig.controls.map((c) =>
      localControlMigrationRecorder(c)
    )
    const formedWidget = {
      ...rest,
      config: parsedConfig
    }
    const formedViews = {
      [widget.viewId]: { model: JSON.parse(widget.model) }
    }
    yield put(widgetGetted(formedWidget, formedViews))

    if (resolve) {
      resolve(formedWidget)
    }
  } catch (err) {
    errorHandler(err)
    reject(err)
  }
}

function* getData(
  renderType: RenderType,
  itemId: number,
  queryConditions: Partial<IQueryConditions>,
  resetPagination?: boolean
) {
  const { resultsetGetted, getResultsetFail } = DashboardActions
  const itemInfo: IShareDashboardItemInfo = yield select((state) =>
    makeSelectItemInfo()(state, itemId)
  )
  const relatedWidget: IWidgetFormed = yield select((state) =>
    makeSelectItemRelatedWidget()(state, itemId)
  )
  const requestParams = getRequestParams(
    relatedWidget,
    itemInfo.queryConditions,
    renderType === 'flush',
    queryConditions
  )
  if (resetPagination) {
    const initialPagination = getInitialPagination(relatedWidget)
    if (initialPagination) {
      const { pageNo, pageSize } = initialPagination
      requestParams.pagination = {
        ...requestParams.pagination,
        pageNo,
        pageSize
      }
    }
  }
  try {
    const result = yield call(request, {
      method: 'post',
      url: `${api.share}/data/${relatedWidget.dataToken}`,
      data: getRequestBody(requestParams)
    })
    const { resultList } = result.payload
    result.payload.resultList = (resultList && resultList.slice(0, 600)) || []
    requestParams.pagination = getUpdatedPagination(
      requestParams.pagination,
      result.payload
    )
    yield put(
      resultsetGetted(renderType, itemId, requestParams, result.payload)
    )
  } catch (err) {
    yield put(getResultsetFail(itemId, getErrorMessage(err)))
  }
}

export function* getResultset(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_SHARE_RESULTSET) {
    return
  }
  const { renderType, itemId, queryConditions } = action.payload
  yield getData(renderType, itemId, queryConditions)
}

export function* getBatchDataWithControlValues(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_BATCH_DATA_WITH_CONTROL_VALUES) {
    return
  }
  const { type, itemId, formValues } = action.payload

  if (type === ControlPanelTypes.Global) {
    const currentDashboard: IDashboard = yield select(makeSelectDashboard())
    const globalControlFormValues = yield select(
      makeSelectGlobalControlPanelFormValues()
    )
    const globalControlConditionsByItem = getCurrentControlValues(
      type,
      currentDashboard.config.filters,
      globalControlFormValues,
      formValues
    )
    const globalControlConditionsByItemEntries: Array<[
      string,
      IGlobalControlConditions
    ]> = Object.entries(
      globalControlConditionsByItem as IGlobalControlConditionsByItem
    )
    while (globalControlConditionsByItemEntries.length) {
      const [itemId, queryConditions] = globalControlConditionsByItemEntries[0]
      yield fork(
        getData,
        'clear',
        Number(itemId),
        queryConditions,
        true
      )
      globalControlConditionsByItemEntries.shift()
    }
  } else {
    const relatedWidget: IWidgetFormed = yield select((state) =>
      makeSelectItemRelatedWidget()(state, itemId)
    )
    const localControlFormValues = yield select((state) =>
      makeSelectLocalControlPanelFormValues()(state, itemId)
    )
    const localControlConditions = getCurrentControlValues(
      type,
      relatedWidget.config.controls,
      localControlFormValues,
      formValues
    )
    yield getData(
      'clear',
      itemId,
      localControlConditions as ILocalControlConditions,
      true
    )
  }
}

export function* getWidgetCsv(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_WIDGET_CSV) {
    return
  }
  const { widgetCsvLoaded, loadWidgetCsvFail } = DashboardActions
  const { itemId, requestParams, token } = action.payload
  const {
    filters,
    tempFilters,
    linkageFilters,
    globalFilters,
    variables,
    linkageVariables,
    globalVariables,
    ...rest
  } = requestParams

  try {
    const path = yield call(request, {
      method: 'post',
      url: `${api.share}/csv/${token}`,
      data: {
        ...rest,
        filters: filters
          .concat(tempFilters)
          .concat(linkageFilters)
          .concat(globalFilters),
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

export function* getSelectOptions(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_SELECT_OPTIONS) {
    return
  }
  const { selectOptionsLoaded, loadSelectOptionsFail } = DashboardActions
  try {
    const { controlKey, dataToken, requestParams, itemId } = action.payload
    const requestParamsMap: Array<[
      string,
      IDistinctValueReqeustParams
    ]> = Object.entries(requestParams)
    const requests = requestParamsMap.map(
      ([viewId, params]: [string, IDistinctValueReqeustParams]) => {
        const { columns, filters, variables, cache, expired } = params
        return call(request, {
          method: 'post',
          url: `${api.share}/data/${dataToken}/distinctvalue/${viewId}`,
          data: {
            columns,
            filters,
            params: variables,
            cache,
            expired
          }
        })
      }
    )
    const results: Array<IDavinciResponse<object[]>> = yield all(requests)
    const indistinctOptions = results.reduce((payloads, r, index) => {
      const { columns } = requestParamsMap[index][1]
      if (columns.length === 1) {
        return payloads.concat(r.payload.map((obj) => obj[columns[0]]))
      }
      return payloads
    }, [])
    const distinctOptions = Array.from(new Set(indistinctOptions)).map((value) => ({
      text: value,
      value
    }))
    yield put(selectOptionsLoaded(controlKey, distinctOptions, itemId))
  } catch (err) {
    yield put(loadSelectOptionsFail(err))
    // errorHandler(err)
  }
}

export function* getDownloadList(action: DashboardActionType) {
  if (action.type !== ActionTypes.LOAD_DOWNLOAD_LIST) {
    return
  }
  const { downloadListLoaded, loadDownloadListFail } = DashboardActions
  const { shareClinetId, token } = action.payload
  try {
    const result = yield call(
      request,
      `${api.download}/share/page/${shareClinetId}/${token}`
    )
    yield put(downloadListLoaded(result.payload))
  } catch (err) {
    yield put(loadDownloadListFail(err))
    errorHandler(err)
  }
}

export function* downloadFile(action: DashboardActionType) {
  if (action.type !== ActionTypes.DOWNLOAD_FILE) {
    return
  }
  const { fileDownloaded, downloadFileFail } = DashboardActions
  const { id, shareClinetId, token } = action.payload
  try {
    location.href = `${api.download}/share/record/file/${id}/${shareClinetId}/${token}`
    yield put(fileDownloaded(id))
  } catch (err) {
    yield put(downloadFileFail(err))
    errorHandler(err)
  }
}

export function* initiateDownloadTask(action: DashboardActionType) {
  if (action.type !== ActionTypes.INITIATE_DOWNLOAD_TASK) {
    return
  }
  const { DownloadTaskInitiated, initiateDownloadTaskFail } = DashboardActions
  const { shareClientId, itemId } = action.payload
  const currentDashboard: IDashboard = yield select(
    makeSelectDashboard()
  )
  const currentDashboardFilters = currentDashboard?.config.filters || []
  const globalControlFormValues = yield select(
    makeSelectGlobalControlPanelFormValues()
  )
  const globalControlConditionsByItem: IGlobalControlConditionsByItem = getCurrentControlValues(
    ControlPanelTypes.Global,
    currentDashboardFilters,
    globalControlFormValues
  )
  const itemInfo: IShareDashboardItemInfo = yield select((state) =>
    makeSelectItemInfo()(state, itemId)
  )
  const relatedWidget: IWidgetFormed = yield select((state) =>
    makeSelectItemRelatedWidget()(state, itemId)
  )
  const localControlFormValues = yield select((state) =>
    makeSelectLocalControlPanelFormValues()(state, itemId)
  )
  const localControlConditions = getCurrentControlValues(
    ControlPanelTypes.Local,
    relatedWidget.config.controls,
    localControlFormValues
  )
  const requestParams = getRequestParams(
    relatedWidget,
    itemInfo.queryConditions,
    false,
    {
      ...globalControlConditionsByItem[itemId],
      ...localControlConditions
    }
  )

  try {
    yield call(request, {
      method: 'POST',
      url: `${api.download}/share/submit/${DownloadTypes.Widget}/${shareClientId}/${relatedWidget.dataToken}`,
      data: [{
        id: relatedWidget.id,
        param: {
          ...getRequestBody(requestParams),
          flush: true,
          pageNo: 0,
          pageSize: 0
        }
      }]
    })
    message.success('下载任务创建成功！')
    yield put(DownloadTaskInitiated(itemId))
  } catch (err) {
    yield put(initiateDownloadTaskFail(err, itemId))
    errorHandler(err)
  }
}

export default function* rootDashboardSaga(): IterableIterator<any> {
  yield all([
    takeLatest(ActionTypes.LOAD_SHARE_DASHBOARD, getDashboard),
    takeEvery(ActionTypes.LOAD_SHARE_WIDGET, getWidget),
    takeEvery(ActionTypes.LOAD_SHARE_RESULTSET, getResultset),
    takeEvery(ActionTypes.LOAD_BATCH_DATA_WITH_CONTROL_VALUES, getBatchDataWithControlValues),
    takeLatest(ActionTypes.LOAD_WIDGET_CSV, getWidgetCsv),
    takeEvery(ActionTypes.LOAD_SELECT_OPTIONS, getSelectOptions),
    takeLatest(ActionTypes.LOAD_DOWNLOAD_LIST, getDownloadList),
    takeLatest(ActionTypes.DOWNLOAD_FILE, downloadFile),
    takeEvery(ActionTypes.INITIATE_DOWNLOAD_TASK, initiateDownloadTask)
  ])
}
