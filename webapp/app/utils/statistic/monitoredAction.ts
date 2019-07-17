import {ActionTypes} from '../../containers/View/constants'
import {
    LOGIN,
    LOGGED,
    INITIATE_DOWNLOAD_TASK,
    INITIATE_DOWNLOAD_TASK_SUCCESS,
    DOWNLOAD_FILE
} from '../../containers/App/constants'

import {
    DRILL_DASHBOARDITEM,
    DELETE_DRILL_HISTORY,
    SELECT_DASHBOARD_ITEM_CHART,
    MONITORED_SYNC_DATA_ACTION,
    GLOBAL_CONTROL_CHANGE,
    MONITORED_SEARCH_DATA_ACTION,
    MONITORED_LINKAGE_DATA_ACTION
} from '../../containers/Dashboard/constants'

const {
    LOAD_VIEW_DATA_FROM_VIZ_ITEM,
    LOAD_VIEW_DATA_FROM_VIZ_ITEM_SUCCESS
} = ActionTypes

import { statistic, IOperation } from './statistic.dv'
//  console.log(statistic.getRecord('terminal'))

export const monitoreAction = (action: string) => {

    const actionType = mapMonitoreToAction(action, statistic.getRecord('operation')['action'])
    if (actionType && actionType.length) {
        statistic.updateSingleFleld<IOperation>('operation', 'action', actionType, (record) => {
            const isDataRequestAction = ['login', 'download_task', 'download'].some((action) => actionType === action)
            if (isDataRequestAction) {
                console.log(record)
            } else {
                console.log(record)
                if (action === LOAD_VIEW_DATA_FROM_VIZ_ITEM_SUCCESS) {
                   // console.log(record.action)
                    // if (!(record.action && record.action.length)) {
                    //     const newRecord = {
                    //         ...record,
                    //         action: 'initial'
                    //     }
                    //     console.log(newRecord)
                    //     return // send request
                    // }
                   // console.log(record)
                }
            }
        })
    } else {
        if (action === LOAD_VIEW_DATA_FROM_VIZ_ITEM_SUCCESS) {
            console.log(`actionType = ${actionType}`)
        }
    }
}



const dataAction = {
    DRILL_DASHBOARDITEM: 'drill',
    DELETE_DRILL_HISTORY: 'drill',
    MONITORED_SYNC_DATA_ACTION: 'sync',
    MONITORED_SEARCH_DATA_ACTION: 'search',
    MONITORED_LINKAGE_DATA_ACTION: 'linkage'
}

const otherAction = {
    LOGGED: 'login',
    INITIATE_DOWNLOAD_TASK_SUCCESS: 'download_task',
    DOWNLOAD_FILE: 'download'
}

function mapMonitoreToAction (action: string, initialType: string) {
    let actionType = initialType
    const isOtherAction = Object.entries(otherAction).map(([k, v]) => k).some((other) => other === action)
    const isDataAction =  Object.entries(dataAction).map(([k, v]) => k).some((other) => other === action)
    if (isOtherAction) {
        actionType = otherAction[action]
        statistic.updateSingleFleld<IOperation>('operation', 'action', actionType)
    }
    if (isDataAction) {
        actionType = dataAction[action]
        statistic.updateSingleFleld<IOperation>('operation', 'action', actionType)
    }
    if (action === LOAD_VIEW_DATA_FROM_VIZ_ITEM_SUCCESS) {
        console.log(actionType)
    }

    switch (action) {
       case LOGGED:
            actionType = 'login'
            break
       case INITIATE_DOWNLOAD_TASK_SUCCESS:
            actionType = 'download_task'
            break
       case DOWNLOAD_FILE:
            actionType = 'download'
            break
       case DRILL_DASHBOARDITEM:
            actionType = 'drill'
            break
       case DELETE_DRILL_HISTORY:
            actionType = 'drill'
            break
       case MONITORED_SYNC_DATA_ACTION:
            actionType = 'sync'
            break
       case MONITORED_SEARCH_DATA_ACTION:
            actionType = 'search'
            break
       case MONITORED_LINKAGE_DATA_ACTION:
            actionType = 'linkage'
            break
        case LOAD_VIEW_DATA_FROM_VIZ_ITEM_SUCCESS:
            console.log(actionType)
            break
        default:
            break
    }
}



