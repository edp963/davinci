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

import { fromJS } from 'immutable'

import {
  LOAD_ORGANIZATIONS_SUCCESS,
  LOAD_ORGANIZATIONS_FAILURE,
  ADD_ORGANIZATION_SUCCESS,
  ADD_ORGANIZATION_FAILURE,
  EDIT_ORGANIZATION_SUCCESS,
  DELETE_ORGANIZATION_SUCCESS,
  LOAD_ORGANIZATION_DETAIL,
  LOAD_ORGANIZATION_DETAIL_SUCCESS
} from './constants'


const initialState = fromJS({
  organizations: null,
  currentOrganization: null,
  currentOrganizationLoading: false
})

function organizationReducer (state = initialState, action) {
  const { type, payload } = action
  const organizations = state.get('organizations')

  switch (type) {
    case LOAD_ORGANIZATIONS_SUCCESS:
      return state.set('organizations', payload.organizations)
    case LOAD_ORGANIZATIONS_FAILURE:
      return state

    case ADD_ORGANIZATION_SUCCESS:
      if (organizations) {
        organizations.unshift(payload.result)
        return state.set('organizations', organizations.slice())
      } else {
        return state.set('organizations', [payload.result])
      }
    case ADD_ORGANIZATION_FAILURE:
      return state

    case EDIT_ORGANIZATION_SUCCESS:
      organizations.splice(organizations.findIndex((d) => d.id === payload.result.id), 1, payload.result)
      return state.set('organizations', organizations.slice())

    case DELETE_ORGANIZATION_SUCCESS:
      return state.set('organizations', organizations.filter((d) => d.id !== payload.id))

    case LOAD_ORGANIZATION_DETAIL:
      return state
        .set('currentOrganizationLoading', true)

    case LOAD_ORGANIZATION_DETAIL_SUCCESS:
      return state
        .set('currentOrganizationLoading', false)
        .set('currentOrganization', payload.organization)
    default:
      return state
  }
}

export default organizationReducer
