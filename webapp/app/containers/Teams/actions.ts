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
  LOAD_TEAMS,
  LOAD_TEAMS_SUCCESS,
  LOAD_TEAMS_FAILURE,
  ADD_TEAM,
  ADD_TEAM_SUCCESS,
  ADD_TEAM_FAILURE,
  EDIT_TEAM,
  EDIT_TEAM_SUCCESS,
  EDIT_TEAM_FAILURE,
  DELETE_TEAM,
  DELETE_TEAM_SUCCESS,
  DELETE_TEAM_FAILURE,
  LOAD_TEAM_DETAIL,
  LOAD_TEAM_DETAIL_SUCCESS,
  LOAD_TEAM_DETAIL_FAILURE
} from './constants'

export function loadTeamDetail (id) {
  return {
    type: LOAD_TEAM_DETAIL,
    payload: {
      id
    }
  }
}



export function loadTeams () {
  return {
    type: LOAD_TEAMS
  }
}

export function teamsLoaded (teams) {
  return {
    type: LOAD_TEAMS_SUCCESS,
    payload: {
      teams
    }
  }
}

export function loadTeamsFail () {
  return {
    type: LOAD_TEAMS_FAILURE
  }
}

export function addTeam (team, resolve) {
  return {
    type: ADD_TEAM,
    payload: {
      team,
      resolve
    }
  }
}

export function teamAdded (result) {
  return {
    type: ADD_TEAM_SUCCESS,
    payload: {
      result
    }
  }
}

export function addTeamFail () {
  return {
    type: ADD_TEAM_FAILURE
  }
}

export function editTeam (team, resolve) {
  return {
    type: EDIT_TEAM,
    payload: {
      team,
      resolve
    }
  }
}

export function teamEdited (result) {
  return {
    type: EDIT_TEAM_SUCCESS,
    payload: {
      result
    }
  }
}

export function editTeamFail () {
  return {
    type: EDIT_TEAM_FAILURE
  }
}

export function deleteTeam (id) {
  return {
    type: DELETE_TEAM,
    payload: {
      id
    }
  }
}

export function teamDeleted (id) {
  return {
    type: DELETE_TEAM_SUCCESS,
    payload: {
      id
    }
  }
}

export function deleteTeamFail () {
  return {
    type: DELETE_TEAM_FAILURE
  }
}

export function teamDetailLoaded (team, widgets) {
  return {
    type: LOAD_TEAM_DETAIL_SUCCESS,
    payload: {
      team,
      widgets
    }
  }
}


export function loadTeamDetailFail (team, widgets) {
  return {
    type: LOAD_TEAM_DETAIL_FAILURE,
    payload: {
      team,
      widgets
    }
  }
}









