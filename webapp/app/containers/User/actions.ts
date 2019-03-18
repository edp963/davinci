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
  LOAD_USERS_FAILURE,
  ADD_USER,
  ADD_USER_SUCCESS,
  ADD_USER_FAILURE,
  DELETE_USER,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAILURE,
  // LOAD_USER_DETAIL,
  // LOAD_USER_DETAIL_SUCCESS,
  LOAD_USER_GROUPS,
  LOAD_USER_GROUPS_SUCCESS,
  LOAD_USER_GROUPS_FAILURE,
  EDIT_USER_INFO,
  EDIT_USER_INFO_SUCCESS,
  EDIT_USER_INFO_FAILURE,
  CHANGE_USER_PASSWORD,
  CHANGE_USER_PASSWORD_SUCCESS,
  CHANGE_USER_PASSWORD_FAILURE
} from './constants'

// export const loadUserDetail = promiseActionCreator(LOAD_USER_DETAIL, ['id'])

export function loadUsers () {
  return {
    type: LOAD_USERS
  }
}

export function usersLoaded (users) {
  return {
    type: LOAD_USERS_SUCCESS,
    payload: {
      users
    }
  }
}

export function loadUsersFail () {
  return {
    type: LOAD_USERS_FAILURE
  }
}

export function addUser (user, resolve) {
  return {
    type: ADD_USER,
    payload: {
      user,
      resolve
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

export function addUserFail () {
  return {
    type: ADD_USER_FAILURE
  }
}

export function deleteUser (id) {
  return {
    type: DELETE_USER,
    payload: {
      id
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

export function deleteUserFail () {
  return {
    type: DELETE_USER_FAILURE
  }
}

// export function userDetailLoaded (user) {
//   return {
//     type: LOAD_USER_DETAIL_SUCCESS,
//     payload: {
//       user
//     }
//   }
// }

export function loadUserGroups (id, resolve) {
  return {
    type: LOAD_USER_GROUPS,
    payload: {
      id,
      resolve
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

export function loadUserGroupsFail () {
  return {
    type: LOAD_USER_GROUPS_FAILURE
  }
}

export function editUserInfo (user, resolve) {
  return {
    type: EDIT_USER_INFO,
    payload: {
      user,
      resolve
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

export function editUserInfoFail () {
  return {
    type: EDIT_USER_INFO_FAILURE
  }
}

export function changeUserPassword (info, resolve, reject) {
  return {
    type: CHANGE_USER_PASSWORD,
    payload: {
      info,
      resolve,
      reject
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

export function changeUserPasswordFail () {
  return {
    type: CHANGE_USER_PASSWORD_FAILURE
  }
}
