import {ActionTypes} from 'containers/View/constants'
import {
  LOGIN,
  LOGGED,
  INITIATE_DOWNLOAD_TASK,
  INITIATE_DOWNLOAD_TASK_SUCCESS,
  DOWNLOAD_FILE
} from 'containers/App/constants'

import {
  DRILL_DASHBOARDITEM,
  DELETE_DRILL_HISTORY,
  SELECT_DASHBOARD_ITEM_CHART,
  MONITORED_SYNC_DATA_ACTION,
  MONITORED_SEARCH_DATA_ACTION,
  MONITORED_LINKAGE_DATA_ACTION
} from 'containers/Dashboard/constants'
import {uuid} from 'utils/util'

interface IDownloadFields {
  action: 'download'
  email: string
  org_id: number
  project_id: string
  project_name: string
  sub_viz_id: number
  sub_viz_name: string
  user_id: number
  viz_id: number
  viz_name: string
  viz_type: 'dashboard' | 'display'
  task_id: number   // 当下载一个dashboard时候， 其下每个widget的单条数据 task_id是一致的
  task_type: 'dashboard' | 'widget'
  widget_id: number
  widget_name: string
  dashboard_rel_widget: number
  groups: string[]
  filters: object[] // 按重构之后的对象数组记录
  variables: string[]
  create_time: string
}




const {
  LOAD_VIEW_DATA_FROM_VIZ_ITEM,
  LOAD_VIEW_DATA_FROM_VIZ_ITEM_SUCCESS
} = ActionTypes

import { statistic, IOperation } from './statistic.dv'


const dataAction = {
  [DRILL_DASHBOARDITEM]: 'drill',
  [DELETE_DRILL_HISTORY]: 'drill',
  [MONITORED_SYNC_DATA_ACTION]: 'sync',
  [MONITORED_SEARCH_DATA_ACTION]: 'search',
  [MONITORED_LINKAGE_DATA_ACTION]: 'linkage'
}

const otherAction = {
  [LOGGED]: 'login',
  [INITIATE_DOWNLOAD_TASK_SUCCESS]: 'download'
}

export const monitoreAction = (action: {type: string, payload: object}) => {
  const actionType = mapMonitoreToAction(action, statistic.getRecord('operation')['action'])
}

const reportAction = ['initial', 'drill', 'sync', 'search', 'linkage']

function getWidgetDetailFieldsbyDownload (action) {
  const taskType = action.payload.type
  const taskId = uuid(8, 16)
  const downloadDetails: IDownloadFields[] = action.statistic && action.statistic.length ? action.statistic.map((statistic) => {
      const {widget: {id, name}, filters, tempFilters, params, groups, itemId} = statistic.param
      return {
        widget_id: id,
        widget_name: name,
        variables: params,
        groups,
        filters: tempFilters ? filters.concat(tempFilters) : filters,
        dashboard_rel_widget: itemId,
        task_type: taskType,
        task_id: taskId
      }
  }) : []
  return downloadDetails
}

function getWidgetDetailFieldsByOthers (action) {
  if (action && action.statistic) {

    const { groups, filters, variables, tempFilters, linkageFilters, tempVariables,
      globalVariables, linkageVariables,  globalFilters, widget: {id, name}} = action.statistic

    let bootstrapFilters = [...filters]
    let bootstrapVariables = [...variables]
    if (tempFilters && tempFilters.length) {
      bootstrapFilters = filters.concat(tempFilters)
    }
    if (linkageFilters && linkageFilters.length) {
      bootstrapFilters = bootstrapFilters.concat(linkageFilters)
    }
    if (globalFilters && globalFilters.length) {
      bootstrapFilters = bootstrapFilters.concat(globalFilters)
    }

    // 全局 本地 联动  变量
    if (linkageVariables && linkageVariables.length) {
      bootstrapVariables = bootstrapVariables.concat(linkageVariables)
    }

    if (globalVariables && globalVariables.length) {
      bootstrapVariables = bootstrapVariables.concat(globalVariables)
    }

    if (tempVariables && tempVariables.length) {
      bootstrapVariables = bootstrapVariables.concat(tempVariables)
    }
    return {
      widget_id: id,
      widget_name: name,
      variables: bootstrapVariables,
      groups,
      filters: bootstrapFilters
    }
  }
  return false

}

function mapMonitoreToAction (action: {type: string, payload: object}, initialType: string) {
  let actionType = initialType
  const isOtherAction = Object.entries(otherAction).map(([k, v]) => k).some((other) => other === action.type)
  const isDataAction =  Object.entries(dataAction).map(([k, v]) => k).some((other) => other === action.type)
  if (isOtherAction) {
    actionType = otherAction[action.type]
  // 避免与initial混淆，此三种状态不update operationRecord  的action值
    if (actionType === 'download') {
      const widgetDetailFields = getWidgetDetailFieldsbyDownload(action)
      const newData = widgetDetailFields.map((widget, index) => ({
        ...widget,
        ...statistic.operationRecord,
        action: actionType,
        create_time: statistic.getCurrentDateTime()
      }))
      statistic.sendOperation(newData)
    }
  }

  if (isDataAction) {
    actionType = dataAction[action.type]
    // change action type
    statistic.updateSingleFleld<IOperation>('operation', 'action', actionType)
  }


  if (action.type === LOAD_VIEW_DATA_FROM_VIZ_ITEM_SUCCESS) {
    // todo 重启定时器
    statistic.isResetTime()
    const widgetDetailFields = getWidgetDetailFieldsByOthers(action)
    if (widgetDetailFields) {
      const newData = {
        ...widgetDetailFields,
        ...statistic.operationRecord,
        ...statistic.userData,
        create_time: statistic.getCurrentDateTime()
      }
      if (reportAction.some((report) => report === actionType)) {
        statistic.sendOperation(newData)
      }
    }
  }
}



