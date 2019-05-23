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
  LOAD_BIZLOGICS,
  LOAD_BIZLOGICS_SUCCESS,
  LOAD_BIZLOGICS_FAILURE,
  ADD_BIZLOGIC,
  ADD_BIZLOGIC_SUCCESS,
  ADD_BIZLOGIC_FAILURE,
  DELETE_BIZLOGIC,
  DELETE_BIZLOGIC_SUCCESS,
  DELETE_BIZLOGIC_FAILURE,
  EDIT_BIZLOGIC,
  EDIT_BIZLOGIC_SUCCESS,
  EDIT_BIZLOGIC_FAILURE,
  CLEAR_BIZDATAS,
  LOAD_SELECT_OPTIONS,
  LOAD_SELECT_OPTIONS_SUCCESS,
  LOAD_SELECT_OPTIONS_FAILURE,
  EXECUTE_SQL,
  EXECUTE_SQL_SUCCESS,
  EXECUTE_SQL_FAILURE,
  LOAD_DATA,
  LOAD_DATA_SUCCESS,
  LOAD_DATA_FAILURE,
  LOAD_DISTINCT_VALUE,
  LOAD_DISTINCT_VALUE_SUCCESS,
  LOAD_DISTINCT_VALUE_FAILURE,
  LOAD_DATA_FROM_ITEM,
  LOAD_DATA_FROM_ITEM_SUCCESS,
  LOAD_DATA_FROM_ITEM_FAILURE,
  LOAD_VIEW_TEAM,
  LOAD_VIEW_TEAM_SUCCESS,
  LOAD_VIEW_TEAM_FAILURE,
  RESET_VIEW_STATE,
  LOAD_SOURCE_TABLE,
  LOAD_SOURCE_TABLE_FAILURE,
  LOAD_SOURCE_TABLE_SUCCESS,
  LOAD_SOURCE_TABLE_COLUMN,
  LOAD_SOURCE_TABLE_COLUMN_FAILURE,
  LOAD_SOURCE_TABLE_COLUMN_SUCCESS
} from './constants'

import { IDataRequestParams } from '../Dashboard/Grid'
import { RenderType } from '../Widget/components/Widget'

export function loadBizlogics (projectId, resolve) {
  return {
    type: LOAD_BIZLOGICS,
    payload: {
      projectId,
      resolve
    }
  }
}

export function bizlogicsLoaded (bizlogics) {
  return {
    type: LOAD_BIZLOGICS_SUCCESS,
    payload: {
      bizlogics
    }
  }
}

export function loadBizlogicsFail () {
  return {
    type: LOAD_BIZLOGICS_FAILURE
  }
}

export function addBizlogic (bizlogic, resolve) {
  return {
    type: ADD_BIZLOGIC,
    payload: {
      bizlogic,
      resolve
    }
  }
}

export function bizlogicAdded (result) {
  return {
    type: ADD_BIZLOGIC_SUCCESS,
    payload: {
      result
    }
  }
}

export function addBizlogicFail () {
  return {
    type: ADD_BIZLOGIC_FAILURE
  }
}

export function deleteBizlogic (id) {
  return {
    type: DELETE_BIZLOGIC,
    payload: {
      id
    }
  }
}

export function bizlogicDeleted (id) {
  return {
    type: DELETE_BIZLOGIC_SUCCESS,
    payload: {
      id
    }
  }
}

export function deleteBizlogicFail () {
  return {
    type: DELETE_BIZLOGIC_FAILURE
  }
}

export function editBizlogic (bizlogic, resolve) {
  return {
    type: EDIT_BIZLOGIC,
    payload: {
      bizlogic,
      resolve
    }
  }
}

export function bizlogicEdited (result) {
  return {
    type: EDIT_BIZLOGIC_SUCCESS,
    payload: {
      result
    }
  }
}

export function editBizlogicFail () {
  return {
    type: EDIT_BIZLOGIC_FAILURE
  }
}

export function clearBizdatas () {
  return {
    type: CLEAR_BIZDATAS
  }
}

export function loadSelectOptions (controlKey, requestParams) {
  return {
    type: LOAD_SELECT_OPTIONS,
    payload: {
      controlKey,
      requestParams
    }
  }
}

export function selectOptionsLoaded (controlKey, values) {
  return {
    type: LOAD_SELECT_OPTIONS_SUCCESS,
    payload: {
      controlKey,
      values
    }
  }
}

export function loadSelectOptionsFail (error) {
  return {
    type: LOAD_SELECT_OPTIONS_FAILURE,
    payload: {
      error
    }
  }
}

export function loadSourceTable (sourceId, resolve) {
  return {
    type: LOAD_SOURCE_TABLE,
    payload: {
      sourceId,
      resolve
    }
  }
}

export function sourceTableLoaded (table) {
  return {
    type: LOAD_SOURCE_TABLE_SUCCESS,
    payload: {
      table
    }
  }
}

export function loadSourceTableFail (error) {
  return {
    type: LOAD_SOURCE_TABLE_FAILURE,
    payload: {
      error
    }
  }
}

export function loadSourceTableColumn (sourceId, tableName, resolve) {
  return {
    type: LOAD_SOURCE_TABLE_COLUMN,
    payload: {
      sourceId,
      tableName,
      resolve
    }
  }
}

export function sourceTableColumnLoaded (column) {
  return {
    type: LOAD_SOURCE_TABLE_COLUMN_SUCCESS,
    payload: {
      column
    }
  }
}

export function loadSourceTableColumnFail (error) {
  return {
    type: LOAD_SOURCE_TABLE_COLUMN_FAILURE,
    payload: {
      error
    }
  }
}

export function executeSql (requestObj, resolve) {
  return {
    type: EXECUTE_SQL,
    payload: {
      requestObj,
      resolve
    }
  }
}

export function sqlExecuted (result) {
  return {
    type: EXECUTE_SQL_SUCCESS,
    payload: {
      result
    }
  }
}

export function executeSqlFail (error) {
  return {
    type: EXECUTE_SQL_FAILURE,
    payload: {
      error
    }
  }
}

export function loadData (id: number, requestParams: IDataRequestParams, resolve: () => void) {
  return {
    type: LOAD_DATA,
    payload: {
      id,
      requestParams,
      resolve
    }
  }
}

export function dataLoaded () {
  return {
    type: LOAD_DATA_SUCCESS
  }
}

export function loadDataFail (error) {
  return {
    type: LOAD_DATA_FAILURE,
    payload: {
      error
    }
  }
}

export function loadDistinctValue (viewId, fieldName, filters?, resolve?) {
  return {
    type: LOAD_DISTINCT_VALUE,
    payload: {
      viewId,
      fieldName,
      filters,
      resolve
    }
  }
}
export function distinctValueLoaded (data, fieldName) {
  return {
    type: LOAD_DISTINCT_VALUE_SUCCESS,
    payload: {
      data,
      fieldName
    }
  }
}
export function loadDistinctValueFail (error) {
  return {
    type: LOAD_DISTINCT_VALUE_FAILURE,
    payload: {
      error
    }
  }
}

export function loadDataFromItem (
  renderType: RenderType,
  itemId: number,
  viewId: number,
  requestParams: IDataRequestParams,
  vizType: 'dashboard' | 'display'
) {
  return {
    type: LOAD_DATA_FROM_ITEM,
    payload: {
      renderType,
      itemId,
      viewId,
      requestParams,
      vizType
    }
  }
}

export function dataFromItemLoaded (renderType, itemId, requestParams, result, vizType: 'dashboard' | 'display') {
  return {
    type: LOAD_DATA_FROM_ITEM_SUCCESS,
    payload: {
      renderType,
      itemId,
      requestParams,
      result,
      vizType
    }
  }
}

export function loadDataFromItemFail (itemId, vizType: 'dashboard' | 'display') {
  return {
    type: LOAD_DATA_FROM_ITEM_FAILURE,
    payload: {
      itemId,
      vizType
    }
  }
}

export function loadViewTeam (projectId, resolve) {
  return {
    type: LOAD_VIEW_TEAM,
    payload: {
      projectId,
      resolve
    }
  }
}

export function viewTeamLoaded (result) {
  return {
    type: LOAD_VIEW_TEAM_SUCCESS,
    payload: {
      result
    }
  }
}

export function loadViewTeamFail (error) {
  return {
    type: LOAD_VIEW_TEAM_FAILURE,
    payload: {
      error
    }
  }
}

export function resetViewState () {
  return {
    type: RESET_VIEW_STATE
  }
}
