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

import {
    LOAD_PORTALS,
    LOAD_PORTALS_SUCCESS,
    LOAD_PORTALS_FAILURE,
    ADD_PORTAL,
    ADD_PORTAL_SUCCESS,
    ADD_PORTAL_FAILURE,
    DELETE_PORTAL,
    DELETE_PORTAL_SUCCESS,
    DELETE_PORTAL_FAILURE,
    EDIT_PORTAL,
    EDIT_PORTAL_SUCCESS,
    EDIT_PORTAL_FAILURE,
    LOAD_SELECT_TEAMS,
    LOAD_SELECT_TEAMS_SUCCESS,
    LOAD_SELECT_TEAMS_FAILURE
  } from './constants'


const initialState = {
    currentPortal: null,
    portals: [],
    selectTeams: []
}

const portalReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case LOAD_PORTALS:
        break
      case LOAD_PORTALS_SUCCESS:
        draft.portals = action.payload.result
        if (action.payload.portalId) {
          draft.currentPortal = draft.portals.find(({ id }) => id === action.payload.portalId)
        }
      case LOAD_PORTALS_FAILURE:
        break
      case ADD_PORTAL:
        break
      case ADD_PORTAL_SUCCESS:
        draft.portals.unshift(action.payload.result)
        break
      case ADD_PORTAL_FAILURE:
        break
      case DELETE_PORTAL:
        break
      case DELETE_PORTAL_SUCCESS:
        draft.portals = draft.portals.filter((g) => g.id !== action.payload.id)
        break

      case DELETE_PORTAL_FAILURE:
        break
      case EDIT_PORTAL:
        break
      case EDIT_PORTAL_SUCCESS:
        draft.portals.splice(draft.portals.findIndex((g) => g.id === action.payload.result.id), 1, action.payload.result)
        break
      case EDIT_PORTAL_FAILURE:
        break
      case LOAD_SELECT_TEAMS:
        break
      case LOAD_SELECT_TEAMS_SUCCESS:
        draft.selectTeams = action.payload.result
        break
      case LOAD_SELECT_TEAMS_FAILURE:
        break
    }
  })

export default portalReducer
