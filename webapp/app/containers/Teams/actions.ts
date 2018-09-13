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
  EDIT_TEAM,
  EDIT_TEAM_SUCCESS,
  EDIT_TEAM_FAILURE,
  DELETE_TEAM,
  DELETE_TEAM_SUCCESS,
  DELETE_TEAM_FAILURE,
  LOAD_TEAM_DETAIL,
  LOAD_TEAM_DETAIL_SUCCESS,
  LOAD_TEAM_DETAIL_FAILURE,
  LOAD_TEAM_PROJECTS,
  LOAD_TEAM_PROJECTS_SUCCESS,
  LOAD_TEAM_PROJECTS_FAILURE,
  LOAD_TEAM_MEMBERS,
  LOAD_TEAM_MEMBERS_SUCCESS,
  LOAD_TEAM_MEMBERS_FAILURE,
  LOAD_TEAM_TEAMS,
  LOAD_TEAM_TEAMS_SUCCESS,
  LOAD_TEAM_TEAMS_FAILURE,
  PULL_MEMBER_IN_TEAM,
  PULL_MEMBER_IN_TEAM_SUCCESS,
  PULL_MEMBRE_IN_TEAM_FAILURE,
  PULL_PROJECT_IN_TEAM,
  PULL_PROJECT_IN_TEAM_SUCCESS,
  PULL_PROJECT_IN_TEAM_FAILURE,
  UPDATE_TEAM_PROJECT_PERMISSION,
  UPDATE_TEAM_PROJECT_PERMISSION_SUCCESS,
  UPDATE_TEAM_PROJECT_PERMISSION_FAILURE,
  DELETE_TEAM_PROJECT,
  DELETE_TEAM_PROJECT_FAILURE,
  DELETE_TEAM_PROJECT_SUCCESS,
  DELETE_TEAM_MEMBER,
  DELETE_TEAM_MEMBER_SUCCESS,
  DELETE_TEAM_MEMBER_ERROR,
  CHANGE_MEMBER_ROLE_TEAM,
  CHANGE_MEMBER_ROLE_TEAM_ERROR,
  CHANGE_MEMBER_ROLE_TEAM_SUCCESS
} from './constants'


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


export function editTeam (team) {
  return {
    type: EDIT_TEAM,
    payload: {
      team
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

export function deleteTeam (id, resolve) {
  return {
    type: DELETE_TEAM,
    payload: {
      id,
      resolve
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


export function loadTeamDetail (id, resolve) {
  return {
    type: LOAD_TEAM_DETAIL,
    payload: {
      id,
      resolve
    }
  }
}

export function teamDetailLoaded (team) {
  return {
    type: LOAD_TEAM_DETAIL_SUCCESS,
    payload: {
      team
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


export function loadTeamProjects (id) {
  return {
    type: LOAD_TEAM_PROJECTS,
    payload: {
      id
    }
  }
}

export function teamProjectsLoaded (projects) {
  return {
    type: LOAD_TEAM_PROJECTS_SUCCESS,
    payload: {
      projects
    }
  }
}

export function loadTeamProjectsFail () {
  return {
    type: LOAD_TEAM_PROJECTS_FAILURE
  }
}

export function loadTeamMembers (id) {
  return {
    type: LOAD_TEAM_MEMBERS,
    payload: {
      id
    }
  }
}

export function teamMembersLoaded (members) {
  return {
    type: LOAD_TEAM_MEMBERS_SUCCESS,
    payload: {
      members
    }
  }
}

export function loadTeamMembersFail () {
  return {
    type: LOAD_TEAM_MEMBERS_FAILURE
  }
}

export function loadTeamTeams (id) {
  return {
    type: LOAD_TEAM_TEAMS,
    payload: {
      id
    }
  }
}

export function teamTeamsLoaded (teams) {
  return {
    type: LOAD_TEAM_TEAMS_SUCCESS,
    payload: {
      teams
    }
  }
}

export function loadTeamTeamsFail () {
  return {
    type: LOAD_TEAM_TEAMS_FAILURE
  }
}

export function pullProjectInTeam (id, projectId, resolve) {
  return {
    type: PULL_PROJECT_IN_TEAM,
    payload: {
      id,
      projectId,
      resolve
    }
  }
}

export function projectInTeamPulled (result) {
  return {
    type: PULL_PROJECT_IN_TEAM_SUCCESS,
    payload: {result}
  }
}

export function pullProjectInTeamFail () {
  return {
    type: PULL_PROJECT_IN_TEAM_FAILURE
  }
}

export function updateTeamProjectPermission (relationId, relTeamProjectDto, resolve) {
  return {
    type: UPDATE_TEAM_PROJECT_PERMISSION,
    payload: {
      relationId, relTeamProjectDto, resolve
    }
  }
}

export function teamProjectPermissionUpdated (result) {
  return {
    type: UPDATE_TEAM_PROJECT_PERMISSION_SUCCESS,
    payload: {
      result
    }
  }
}

export function updateTeamProjectPermissionFail () {
  return {
    type: UPDATE_TEAM_PROJECT_PERMISSION_FAILURE
  }
}

export function deleteTeamProject (relationId) {
  return {
    type: DELETE_TEAM_PROJECT,
    payload: {
      relationId
    }
  }
}

export function teamProjectDeleted (id) {
  return {
    type: DELETE_TEAM_PROJECT_SUCCESS,
    payload: {
      id
    }
  }
}

export function deleteTeamProjectFail () {
  return {
    type: DELETE_TEAM_PROJECT_FAILURE
  }
}

export function deleteTeamMember (relationId) {
  return {
    type: DELETE_TEAM_MEMBER,
    payload: {
      relationId
    }
  }
}

export function teamMemberDeleted (id) {
  return {
    type: DELETE_TEAM_MEMBER_SUCCESS,
    payload: {
      id
    }
  }
}

export function deleteTeamMemberFail () {
  return {
    type: DELETE_TEAM_MEMBER_ERROR
  }
}

export function pullMemberInTeam (teamId, memberId, resolve) {
  return {
    type: PULL_MEMBER_IN_TEAM,
    payload: {
      teamId,
      memberId,
      resolve
    }
  }
}

export function memberInTeamPulled (result) {
  return {
    type: PULL_MEMBER_IN_TEAM_SUCCESS,
    payload: {
      result
    }
  }
}

export function pullMemberInTeamFail () {
  return {
    type: PULL_MEMBRE_IN_TEAM_FAILURE
  }
}

export function changeTeamMemberRole (relationId, newRole) {
  return {
    type: CHANGE_MEMBER_ROLE_TEAM,
    payload: {
      relationId,
      newRole
    }
  }
}

export function teamMemberRoleChanged (relationId, newRole) {
  return {
    type: CHANGE_MEMBER_ROLE_TEAM_SUCCESS,
    payload: {
      relationId,
      newRole
    }
  }
}

export function changeTeamMemberRoleFail () {
  return {
    type: CHANGE_MEMBER_ROLE_TEAM_ERROR
  }
}



