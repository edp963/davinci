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
  LOAD_TEAMS_SUCCESS,
  LOAD_TEAMS_FAILURE,
  ADD_TEAM_SUCCESS,
  ADD_TEAM_FAILURE,
  EDIT_TEAM_SUCCESS,
  DELETE_TEAM_SUCCESS,
  LOAD_TEAM_DETAIL,
  LOAD_TEAM_DETAIL_SUCCESS,
  LOAD_TEAM_PROJECTS_SUCCESS,
  LOAD_TEAM_MEMBERS_SUCCESS,
  LOAD_TEAM_TEAMS_SUCCESS
} from './constants'


const initialState = fromJS({
  teams: [],
  currentTeam: {},
  currentTeamLoading: false,
  currentTeamProjects: [],
  currentTeamTeams: [],
  currentTeamMembers: []
})

function teamReducer (state = initialState, action) {
  const { type, payload } = action
  const teams = state.get('teams')
  const currentTeamTeams = state.get('currentTeamTeams')
  switch (type) {
    case LOAD_TEAMS_SUCCESS:
      return state.set('teams', payload.teams)
    case LOAD_TEAMS_FAILURE:
      return state
    case EDIT_TEAM_SUCCESS:
      teams.splice(teams.findIndex((d) => d.id === payload.result.id), 1, payload.result)
      return state.set('teams', teams.slice())
    case DELETE_TEAM_SUCCESS:
      return state.set('teams', teams.filter((d) => d.id !== payload.id))
    case LOAD_TEAM_DETAIL:
      return state
        .set('currentTeamLoading', true)
    case LOAD_TEAM_DETAIL_SUCCESS:
      return state
        .set('currentTeamLoading', false)
        .set('currentTeam', payload.team)
    case LOAD_TEAM_PROJECTS_SUCCESS:
      return state.set('currentTeamProjects', payload.projects)
    case LOAD_TEAM_MEMBERS_SUCCESS:
      return state.set('currentTeamMembers', payload.members)
    case LOAD_TEAM_TEAMS_SUCCESS:
      return state.set('currentTeamTeams', payload.teams)
    default:
      return state
  }
}

export default teamReducer
