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
  // LOAD_BIZLOGIC_DETAIL,
  // LOAD_BIZLOGIC_DETAIL_SUCCESS,
  LOAD_BIZLOGIC_GROUPS,
  LOAD_BIZLOGIC_GROUPS_SUCCESS,
  LOAD_BIZLOGIC_GROUPS_FAILURE,
  EDIT_BIZLOGIC,
  EDIT_BIZLOGIC_SUCCESS,
  EDIT_BIZLOGIC_FAILURE,
  LOAD_BIZDATAS,
  LOAD_BIZDATAS_SUCCESS,
  LOAD_BIZDATAS_FAILURE,
  LOAD_BIZDATAS_FROM_ITEM,
  LOAD_BIZDATAS_FROM_ITEM_SUCCESS,
  LOAD_BIZDATAS_FROM_ITEM_FAILURE,
  CLEAR_BIZDATAS,
  SQL_VALIDATE,
  SQL_VALIDATE_SUCCESS,
  SQL_VALIDATE_FAILURE,
  LOAD_CASCADESOURCE_FROM_ITEM,
  LOAD_CASCADESOURCE_FROM_ITEM_SUCCESS,
  LOAD_CASCADESOURCE_FROM_ITEM_FAILURE,
  LOAD_CASCADESOURCE_FROM_DASHBOARD,
  LOAD_CASCADESOURCE_FROM_DASHBOARD_SUCCESS,
  LOAD_CASCADESOURCE_FROM_DASHBOARD_FAILURE,
  LOAD_BIZDATA_SCHEMA,
  LOAD_BIZDATA_SCHEMA_SUCCESS,
  LOAD_BIZDATA_SCHEMA_FAILURE
} from './constants'

// export const loadBizlogicDetail = promiseActionCreator(LOAD_BIZLOGIC_DETAIL, ['id'])

export function loadBizlogics () {
  return {
    type: LOAD_BIZLOGICS
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

// export function bizlogicDetailLoaded (bizlogic) {
//   return {
//     type: LOAD_BIZLOGIC_DETAIL_SUCCESS,
//     payload: {
//       bizlogic
//     }
//   }
// }

export function loadBizlogicGroups (id, resolve) {
  return {
    type: LOAD_BIZLOGIC_GROUPS,
    payload: {
      id,
      resolve
    }
  }
}

export function bizlogicGroupsLoaded (groups) {
  return {
    type: LOAD_BIZLOGIC_GROUPS_SUCCESS,
    payload: {
      groups
    }
  }
}

export function loadBizlogicGroupsFail () {
  return {
    type: LOAD_BIZLOGIC_GROUPS_FAILURE
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

export function loadBizdatas (id, sql, sorts, offset, limit) {
  return {
    type: LOAD_BIZDATAS,
    payload: {
      id,
      sql,
      sorts,
      offset,
      limit
    }
  }
}

export function bizdatasLoaded (bizdatas) {
  return {
    type: LOAD_BIZDATAS_SUCCESS,
    payload: {
      bizdatas
    }
  }
}

export function loadBizdatasFail (error) {
  return {
    type: LOAD_BIZDATAS_FAILURE,
    payload: {
      error
    }
  }
}

export function loadBizdatasFromItem (itemId, id, sql, sorts, offset, limit, useCache, expired) {
  return {
    type: LOAD_BIZDATAS_FROM_ITEM,
    payload: {
      itemId,
      id,
      sql,
      sorts,
      offset,
      limit,
      useCache,
      expired
    }
  }
}

export function bizdatasFromItemLoaded (itemId, bizdatas) {
  return {
    type: LOAD_BIZDATAS_FROM_ITEM_SUCCESS,
    payload: {
      itemId,
      bizdatas
    }
  }
}

export function loadBizdatasFromItemFail (error) {
  return {
    type: LOAD_BIZDATAS_FROM_ITEM_FAILURE,
    payload: {
      error
    }
  }
}

export function clearBizdatas () {
  return {
    type: CLEAR_BIZDATAS
  }
}

export function sqlValidate (sourceId, sql) {
  return {
    type: SQL_VALIDATE,
    payload: {
      sourceId,
      sql
    }
  }
}

export function validateSqlSuccess (payload) {
  return {
    type: SQL_VALIDATE_SUCCESS,
    payload
  }
}

export function validateSqlFailure (error) {
  return {
    type: SQL_VALIDATE_FAILURE,
    Payload: {
      error
    }
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
