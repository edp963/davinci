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

import produce from 'immer'
import { ActionTypes } from './constants'
import { ControlActionType } from './actions'
import { ActionTypes as ViewActionTypes } from 'app/containers/View/constants'
import { ActionTypes as DashboardActionTypes } from 'app/containers/Dashboard/constants'
import { ActionTypes as ShareDashboardActionTypes } from 'share/containers/Dashboard/constants'
import { ActionTypes as VizActionTypes} from 'app/containers/Viz/constants'
import { ViewActionType } from 'app/containers/View/actions'
import { DashboardActionType } from 'app/containers/Dashboard/actions'
import { DashboardActionType as ShareDashboardActionType } from 'share/containers/Dashboard/actions'
import { VizActionType } from 'app/containers/Viz/actions'
import { IControlState } from './types'

const initialState: IControlState = {
  globalControlPanelFormValues: {},
  globalControlPanelSelectOptions: {},
  localControlPanelFormValues: {},
  localControlPanelSelectOptions: {}
}

const controlReducer = (
  state = initialState,
  action:
    | ControlActionType
    | ViewActionType
    | DashboardActionType
    | ShareDashboardActionType
    | VizActionType
): IControlState =>
  produce(state, (draft) => {
    switch (action.type) {
      case DashboardActionTypes.LOAD_DASHBOARD_DETAIL_SUCCESS:
      case ShareDashboardActionTypes.LOAD_SHARE_DASHBOARD_SUCCESS:
        const { items } = action.payload
        draft.globalControlPanelFormValues = {}
        draft.globalControlPanelSelectOptions = {}
        draft.localControlPanelFormValues = items.reduce((obj, w) => {
          obj[w.id] = {}
          return obj
        }, {})
        draft.localControlPanelSelectOptions = items.reduce((obj, w) => {
          obj[w.id] = {}
          return obj
        }, {})
        break

      case ShareDashboardActionTypes.SET_INDIVIDUAL_DASHBOARD:
        draft.globalControlPanelFormValues = {}
        draft.globalControlPanelSelectOptions = {}
        draft.localControlPanelFormValues = {
          1: {}
        }
        draft.localControlPanelSelectOptions = {
          1: {}
        }
        break

      case VizActionTypes.EDIT_CURRENT_DASHBOARD_SUCCESS:
        if (action.payload.type === 'control') {
          draft.globalControlPanelFormValues = {}
        }
        break

      case DashboardActionTypes.ADD_DASHBOARD_ITEMS_SUCCESS:
        action.payload.items.forEach((item) => {
          draft.localControlPanelFormValues[item.id] = {}
          draft.localControlPanelSelectOptions[item.id] = {}
        })
        break

      case DashboardActionTypes.DELETE_DASHBOARD_ITEM_SUCCESS:
        delete draft.localControlPanelFormValues[action.payload.id]
        delete draft.localControlPanelSelectOptions[action.payload.id]
        break

      case DashboardActionTypes.CLEAR_CURRENT_DASHBOARD:
        draft.globalControlPanelFormValues = {}
        draft.globalControlPanelSelectOptions = {}
        draft.localControlPanelFormValues = {}
        draft.localControlPanelSelectOptions = {}
        break

      case ActionTypes.SET_GLOBAL_CONTROL_PANEL_FORM_VALUES:
        draft.globalControlPanelFormValues = action.payload.values
        break

      case ActionTypes.SET_LOCAL_CONTROL_PANEL_FORM_VALUES:
        draft.localControlPanelFormValues[action.payload.itemId] =
          action.payload.values
        break

      case ViewActionTypes.LOAD_SELECT_OPTIONS_SUCCESS:
      case ShareDashboardActionTypes.LOAD_SELECT_OPTIONS_SUCCESS:
        if (action.payload.itemId) {
          draft.localControlPanelSelectOptions[action.payload.itemId][
            action.payload.controlKey
          ] = action.payload.values
        } else {
          draft.globalControlPanelSelectOptions[action.payload.controlKey] =
            action.payload.values
        }
        break

      case ActionTypes.SET_SELECT_OPTIONS:
        if (action.payload.itemId) {
          draft.localControlPanelSelectOptions[action.payload.itemId][
            action.payload.controlKey
          ] = action.payload.options
        } else {
          draft.globalControlPanelSelectOptions[action.payload.controlKey] =
            action.payload.options
        }
        break

      default:
        break
    }
  })

export default controlReducer
