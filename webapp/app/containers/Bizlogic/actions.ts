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
  LOAD_CASCADESOURCE_FROM_ITEM,
  LOAD_CASCADESOURCE_FROM_ITEM_SUCCESS,
  LOAD_CASCADESOURCE_FROM_ITEM_FAILURE,
  LOAD_CASCADESOURCE_FROM_DASHBOARD,
  LOAD_CASCADESOURCE_FROM_DASHBOARD_SUCCESS,
  LOAD_CASCADESOURCE_FROM_DASHBOARD_FAILURE,
  LOAD_BIZDATA_SCHEMA,
  LOAD_BIZDATA_SCHEMA_SUCCESS,
  LOAD_BIZDATA_SCHEMA_FAILURE,
  LOAD_SCHEMA,
  LOAD_SCHEMA_SUCCESS,
  LOAD_SCHEMA_FAILURE,
  EXECUTE_SQL,
  EXECUTE_SQL_SUCCESS,
  EXECUTE_SQL_FAILURE,
  LOAD_DATA,
  LOAD_DATA_SUCCESS,
  LOAD_DATA_FAILURE,
  LOAD_DATA_FROM_ITEM,
  LOAD_DATA_FROM_ITEM_SUCCESS,
  LOAD_DATA_FROM_ITEM_FAILURE
} from './constants'

export function loadBizlogics (projectId) {
  return {
    type: LOAD_BIZLOGICS,
    payload: {
      projectId
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

export function loadCascadeSourceFromItem (itemId, controlId, id, sql, column, parents) {
  return {
    type: LOAD_CASCADESOURCE_FROM_ITEM,
    payload: {
      itemId,
      controlId,
      id,
      sql,
      column,
      parents
    }
  }
}

export function cascadeSourceFromItemLoaded (itemId, controlId, column, values) {
  return {
    type: LOAD_CASCADESOURCE_FROM_ITEM_SUCCESS,
    payload: {
      itemId,
      controlId,
      column,
      values
    }
  }
}

export function loadCascadeSourceFromItemFail (error) {
  return {
    type: LOAD_CASCADESOURCE_FROM_ITEM_FAILURE,
    payload: {
      error
    }
  }
}

export function loadCascadeSourceFromDashboard (controlId, id, column, parents) {
  return {
    type: LOAD_CASCADESOURCE_FROM_DASHBOARD,
    payload: {
      controlId,
      id,
      column,
      parents
    }
  }
}

export function cascadeSourceFromDashboardLoaded (controlId, column, values) {
  return {
    type: LOAD_CASCADESOURCE_FROM_DASHBOARD_SUCCESS,
    payload: {
      controlId,
      column,
      values
    }
  }
}

export function loadCascadeSourceFromDashboardFail (error) {
  return {
    type: LOAD_CASCADESOURCE_FROM_DASHBOARD_FAILURE,
    payload: {
      error
    }
  }
}

export function loadBizdataSchema (id, resolve) {
  return {
    type: LOAD_BIZDATA_SCHEMA,
    payload: {
      id,
      resolve
    }
  }
}

export function bizdataSchemaLoaded (scheme) {
  return {
    type: LOAD_BIZDATA_SCHEMA_SUCCESS,
    payload: {
      scheme
    }
  }
}

export function loadBizdataSchemaFail (error) {
  return {
    type: LOAD_BIZDATA_SCHEMA_FAILURE,
    payload: {
      error
    }
  }
}

export function loadSchema (sourceId, resolve) {
  return {
    type: LOAD_SCHEMA,
    payload: {
      sourceId,
      resolve
    }
  }
}

export function schemaLoaded (schema) {
  return {
    type: LOAD_SCHEMA_SUCCESS,
    payload: {
      schema
    }
  }
}

export function loadSchemaFail () {
  return {
    type: LOAD_SCHEMA_FAILURE
  }
}

export function executeSql (sourceId, sql, resolve) {
  return {
    type: EXECUTE_SQL,
    payload: {
      sourceId,
      sql,
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

export function executeSqlFail () {
  return {
    type: EXECUTE_SQL_FAILURE
  }
}

export function loadData (id, params, resolve) {
  return {
    type: LOAD_DATA,
    payload: {
      id,
      params,
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

export function loadDataFromItem (itemId, viewId, groups, aggregators, sql, cache, expired) {
  return {
    type: LOAD_DATA_FROM_ITEM,
    payload: {
      itemId,
      viewId,
      groups,
      aggregators,
      sql,
      cache,
      expired
    }
  }
}

export function dataFromItemLoaded (itemId, data) {
  return {
    type: LOAD_DATA_FROM_ITEM_SUCCESS,
    payload: {
      itemId,
      data
    }
  }
}

export function loadDataFromItemFail (error) {
  return {
    type: LOAD_DATA_FROM_ITEM_FAILURE,
    payload: {
      error
    }
  }
}
