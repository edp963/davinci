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
  LOAD_USERS,
  LOAD_USERS_SUCCESS,
  ADD_USER,
  ADD_USER_SUCCESS,
  DELETE_USER,
  DELETE_USER_SUCCESS,
  LOAD_USER_DETAIL,
  LOAD_USER_DETAIL_SUCCESS,
  LOAD_USER_GROUPS,
  LOAD_USER_GROUPS_SUCCESS,
  EDIT_USER_INFO,
  EDIT_USER_INFO_SUCCESS,
  CHANGE_USER_PASSWORD,
  CHANGE_USER_PASSWORD_SUCCESS
} from './constants'

import { promiseActionCreator } from '../../utils/reduxPromisation'

export const loadUsers = promiseActionCreator(LOAD_USERS)

export const addUser = promiseActionCreator(ADD_USER, ['user'])

export const deleteUser = promiseActionCreator(DELETE_USER, ['id'])

export const loadUserDetail = promiseActionCreator(LOAD_USER_DETAIL, ['id'])

export const loadUserGroups = promiseActionCreator(LOAD_USER_GROUPS, ['id'])

export const editUserInfo = promiseActionCreator(EDIT_USER_INFO, ['user'])

export const changeUserPassword = promiseActionCreator(CHANGE_USER_PASSWORD, ['info'])

export function usersLoaded (users) {
  return {
    type: LOAD_USERS_SUCCESS,
    payload: {
      users
    }
  }
}

export function userAdded (result) {
  return {
    type: ADD_USER_SUCCESS,
    payload: {
      result
    }
  }
}

export function userDeleted (id) {
  return {
    type: DELETE_USER_SUCCESS,
    payload: {
      id
    }
  }
}

export function userDetailLoaded (user) {
  return {
    type: LOAD_USER_DETAIL_SUCCESS,
    payload: {
      user
    }
  }
}

export function userGroupsLoaded (groups) {
  return {
    type: LOAD_USER_GROUPS_SUCCESS,
    payload: {
      groups
    }
  }
}

export function userInfoEdited (result) {
  return {
    type: EDIT_USER_INFO_SUCCESS,
    payload: {
      result
    }
  }
}

export function userPasswordChanged (result) {
  return {
    type: CHANGE_USER_PASSWORD_SUCCESS,
    payload: {
      result
    }
  }
}
