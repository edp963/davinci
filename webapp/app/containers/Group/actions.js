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
  LOAD_GROUPS,
  LOAD_GROUPS_SUCCESS,
  ADD_GROUP,
  ADD_GROUP_SUCCESS,
  DELETE_GROUP,
  DELETE_GROUP_SUCCESS,
  LOAD_GROUP_DETAIL,
  LOAD_GROUP_DETAIL_SUCCESS,
  EDIT_GROUP,
  EDIT_GROUP_SUCCESS
} from './constants'

import { promiseActionCreator } from '../../utils/reduxPromisation'

export const loadGroups = promiseActionCreator(LOAD_GROUPS)

export const addGroup = promiseActionCreator(ADD_GROUP, ['group'])

export const deleteGroup = promiseActionCreator(DELETE_GROUP, ['id'])

export const loadGroupDetail = promiseActionCreator(LOAD_GROUP_DETAIL, ['id'])

export const editGroup = promiseActionCreator(EDIT_GROUP, ['group'])

export function groupsLoaded (groups) {
  return {
    type: LOAD_GROUPS_SUCCESS,
    payload: {
      groups
    }
  }
}

export function groupAdded (result) {
  return {
    type: ADD_GROUP_SUCCESS,
    payload: {
      result
    }
  }
}

export function groupDeleted (id) {
  return {
    type: DELETE_GROUP_SUCCESS,
    payload: {
      id
    }
  }
}

export function groupDetailLoaded (group) {
  return {
    type: LOAD_GROUP_DETAIL_SUCCESS,
    payload: {
      group
    }
  }
}

export function groupEdited (result) {
  return {
    type: EDIT_GROUP_SUCCESS,
    payload: {
      result
    }
  }
}
