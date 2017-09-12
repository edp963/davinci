/*-
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
  ADD_BIZLOGIC,
  ADD_BIZLOGIC_SUCCESS,
  DELETE_BIZLOGIC,
  DELETE_BIZLOGIC_SUCCESS,
  LOAD_BIZLOGIC_DETAIL,
  LOAD_BIZLOGIC_DETAIL_SUCCESS,
  LOAD_BIZLOGIC_GROUPS,
  LOAD_BIZLOGIC_GROUPS_SUCCESS,
  EDIT_BIZLOGIC,
  EDIT_BIZLOGIC_SUCCESS,
  LOAD_BIZDATAS,
  LOAD_BIZDATAS_SUCCESS,
  LOAD_BIZDATAS_FROM_ITEM,
  LOAD_BIZDATAS_FROM_ITEM_SUCCESS
} from './constants'

import { promiseActionCreator } from '../../utils/reduxPromisation'

export const loadBizlogics = promiseActionCreator(LOAD_BIZLOGICS)

export const addBizlogic = promiseActionCreator(ADD_BIZLOGIC, ['bizlogic'])

export const deleteBizlogic = promiseActionCreator(DELETE_BIZLOGIC, ['id'])

export const loadBizlogicDetail = promiseActionCreator(LOAD_BIZLOGIC_DETAIL, ['id'])

export const loadBizlogicGroups = promiseActionCreator(LOAD_BIZLOGIC_GROUPS, ['id'])

export const editBizlogic = promiseActionCreator(EDIT_BIZLOGIC, ['bizlogic'])

export const loadBizdatas = promiseActionCreator(LOAD_BIZDATAS, ['id', 'sql', 'sorts', 'offset', 'limit'])

export const loadBizdatasFromItem = promiseActionCreator(LOAD_BIZDATAS_FROM_ITEM, ['itemId', 'id', 'sql', 'sorts', 'offset', 'limit'])

export function bizlogicsLoaded (bizlogics) {
  return {
    type: LOAD_BIZLOGICS_SUCCESS,
    payload: {
      bizlogics
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

export function bizlogicDeleted (id) {
  return {
    type: DELETE_BIZLOGIC_SUCCESS,
    payload: {
      id
    }
  }
}

export function bizlogicDetailLoaded (bizlogic) {
  return {
    type: LOAD_BIZLOGIC_DETAIL_SUCCESS,
    payload: {
      bizlogic
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

export function bizlogicEdited (result) {
  return {
    type: EDIT_BIZLOGIC_SUCCESS,
    payload: {
      result
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

export function bizdatasFromItemLoaded (itemId, bizdatas) {
  return {
    type: LOAD_BIZDATAS_FROM_ITEM_SUCCESS,
    payload: {
      itemId,
      bizdatas
    }
  }
}
