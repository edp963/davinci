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
import { ActionTypes } from 'app/containers/Projects/constants'
import actions from 'app/containers/Projects/actions'
import { mockStore } from './fixtures'

describe('Projects Actions', () => {
  const {
    project,
    projectId,
    projects,
    resolve,
    orgId,
    isFavorite,
    adminIds,
    relationId
  } = mockStore
  describe('clearCurrentProject', () => {
    it('clearCurrentProject should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.CLEAR_CURRENT_PROJECT
      }
      expect(actions.clearCurrentProject()).toEqual(expectedResult)
    })
  })

  describe('loadProjects', () => {
    it('loadProjects should return the correct type', () => {
      const expectedResult = { type: ActionTypes.LOAD_PROJECTS }
      expect(actions.loadProjects()).toEqual(expectedResult)
    })
  })
  describe('projectsLoaded', () => {
    it('projectsLoaded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_PROJECTS_SUCCESS,
        payload: {
          projects
        }
      }
      expect(actions.projectsLoaded(projects)).toEqual(expectedResult)
    })
  })
  describe('loadProjectsFail', () => {
    it('loadProjectsFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_PROJECTS_FAILURE
      }
      expect(actions.loadProjectsFail()).toEqual(expectedResult)
    })
  })

  describe('addProject', () => {
    it('addProject should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_PROJECT,
        payload: {
          project,
          resolve
        }
      }
      expect(actions.addProject(project, resolve)).toEqual(expectedResult)
    })
  })
  describe('projectAdded', () => {
    it('projectAdded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_PROJECT_SUCCESS,
        payload: {
          result: project
        }
      }
      expect(actions.projectAdded(project)).toEqual(expectedResult)
    })
  })
  describe('addProjectFail', () => {
    it('addProjectFail should return the correct type', () => {
      const expectedResult = { type: ActionTypes.ADD_PROJECT_FAILURE }
      expect(actions.addProjectFail()).toEqual(expectedResult)
    })
  })

  describe('editProject', () => {
    it('editProject should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EDIT_PROJECT,
        payload: {
          project,
          resolve
        }
      }
      expect(actions.editProject(project, resolve)).toEqual(expectedResult)
    })
  })
  describe('projectEdited', () => {
    it('projectEdited should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EDIT_PROJECT_SUCCESS,
        payload: {
          result: project
        }
      }
      expect(actions.projectEdited(project)).toEqual(expectedResult)
    })
  })
  describe('editProjectFail', () => {
    it('editProjectFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EDIT_PROJECT_FAILURE
      }
      expect(actions.editProjectFail()).toEqual(expectedResult)
    })
  })

  describe('transferProject', () => {
    it('transferProject should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.TRANSFER_PROJECT,
        payload: {
          id: projectId,
          orgId,
          resolve
        }
      }
      expect(actions.transferProject(projectId, orgId, resolve)).toEqual(
        expectedResult
      )
    })
  })
  describe('projectTransfered', () => {
    it('projectTransfered should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.TRANSFER_PROJECT_SUCCESS,
        payload: { result: project }
      }
      expect(actions.projectTransfered(project)).toEqual(expectedResult)
    })
  })
  describe('transferProjectFail', () => {
    it('transferProjectFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.TRANSFER_PROJECT_FAILURE
      }
      expect(actions.transferProjectFail()).toEqual(expectedResult)
    })
  })

  describe('deleteProject', () => {
    it('deleteProject should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_PROJECT,
        payload: {
          id: projectId,
          resolve
        }
      }
      expect(actions.deleteProject(projectId, resolve)).toEqual(expectedResult)
    })
  })
  describe('projectDeleted', () => {
    it('projectDeleted should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_PROJECT_SUCCESS,
        payload: {
          id: projectId
        }
      }
      expect(actions.projectDeleted(projectId)).toEqual(expectedResult)
    })
  })
  describe('deleteProjectFail', () => {
    it('deleteProjectFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_PROJECT_FAILURE
      }
      expect(actions.deleteProjectFail()).toEqual(expectedResult)
    })
  })

  describe('loadProjectDetail', () => {
    it('loadProjectDetail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_PROJECT_DETAIL,
        payload: { id: projectId }
      }
      expect(actions.loadProjectDetail(projectId)).toEqual(expectedResult)
    })
  })
  describe('projectDetailLoaded', () => {
    it('projectDetailLoaded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_PROJECT_DETAIL_SUCCESS,
        payload: {
          project
        }
      }
      expect(actions.projectDetailLoaded(project)).toEqual(expectedResult)
    })
  })
  describe('loadProjectDetailFail', () => {
    it('loadProjectDetailFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_PROJECT_DETAIL_FAILURE
      }
      expect(actions.loadProjectDetailFail()).toEqual(expectedResult)
    })
  })

  describe('searchProject', () => {
    it('searchProject should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.SEARCH_PROJECT,
        payload: {
          param: 'projectName'
        }
      }
      expect(actions.searchProject('projectName')).toEqual(expectedResult)
    })
  })
  describe('projectSearched', () => {
    it('projectSearched should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.SEARCH_PROJECT_SUCCESS,
        payload: {
          result: project
        }
      }
      expect(actions.projectSearched(project)).toEqual(expectedResult)
    })
  })
  describe('searchProjectFail', () => {
    it('searchProjectFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.SEARCH_PROJECT_FAILURE
      }
      expect(actions.searchProjectFail()).toEqual(expectedResult)
    })
  })

  describe('getProjectStarUser', () => {
    it('getProjectStarUser should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.GET_PROJECT_STAR_USER,
        payload: {
          id: projectId
        }
      }
      expect(actions.getProjectStarUser(projectId)).toEqual(expectedResult)
    })
  })
  describe('getProjectStarUserSuccess', () => {
    it('getProjectStarUserSuccess should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.GET_PROJECT_STAR_USER_SUCCESS,
        payload: { result: project }
      }
      expect(actions.getProjectStarUserSuccess(project)).toEqual(expectedResult)
    })
  })
  describe('getProjectStarUserFail', () => {
    it('getProjectStarUserFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.GET_PROJECT_STAR_USER_FAILURE
      }
      expect(actions.getProjectStarUserFail()).toEqual(expectedResult)
    })
  })

  describe('unStarProject', () => {
    it('unStarProject should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.PROJECT_UNSTAR,
        payload: {
          id: projectId,
          resolve
        }
      }
      expect(actions.unStarProject(projectId, resolve)).toEqual(expectedResult)
    })
  })
  describe('unStarProjectSuccess', () => {
    it('unStarProjectSuccess should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.PROJECT_UNSTAR_SUCCESS,
        payload: { result: project }
      }
      expect(actions.unStarProjectSuccess(project)).toEqual(expectedResult)
    })
  })
  describe('unStarProjectFail', () => {
    it('unStarProjectFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.PROJECT_UNSTAR_FAILURE
      }
      expect(actions.unStarProjectFail()).toEqual(expectedResult)
    })
  })
  describe('loadCollectProjects', () => {
    it('loadCollectProjects should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_COLLECT_PROJECTS
      }
      expect(actions.loadCollectProjects()).toEqual(expectedResult)
    })
  })
  describe('collectProjectLoaded', () => {
    it('collectProjectLoaded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_COLLECT_PROJECTS_SUCCESS,
        payload: {
          result: project
        }
      }
      expect(actions.collectProjectLoaded(project)).toEqual(expectedResult)
    })
  })
  describe('collectProjectFail', () => {
    it('collectProjectFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_COLLECT_PROJECTS_FAILURE
      }
      expect(actions.collectProjectFail()).toEqual(expectedResult)
    })
  })
  describe('clickCollectProjects', () => {
    it('clickCollectProjects should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.CLICK_COLLECT_PROJECT,
        payload: {
          isFavorite,
          proId: projectId,
          resolve
        }
      }
      expect(
        actions.clickCollectProjects(isFavorite, projectId, resolve)
      ).toEqual(expectedResult)
    })
  })
  describe('collectProjectClicked', () => {
    it('collectProjectClicked should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.CLICK_COLLECT_PROJECT_SUCCESS,
        payload: {
          result: project
        }
      }
      expect(actions.collectProjectClicked(project)).toEqual(expectedResult)
    })
  })
  describe('clickCollectProjectFail', () => {
    it('clickCollectProjectFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.CLICK_COLLECT_PROJECT_FAILURE
      }
      expect(actions.clickCollectProjectFail()).toEqual(expectedResult)
    })
  })
  describe('addProjectAdmin', () => {
    it('addProjectAdmin should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_PROJECT_ADMIN,
        payload: {
          id: projectId,
          adminIds,
          resolve
        }
      }
      expect(actions.addProjectAdmin(projectId, adminIds, resolve)).toEqual(
        expectedResult
      )
    })
  })
  describe('projectAdminAdded', () => {
    it('projectAdminAdded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_PROJECT_ADMIN_SUCCESS,
        payload: { result: project }
      }
      expect(actions.projectAdminAdded(project)).toEqual(expectedResult)
    })
  })
  describe('addProjectAdminFail', () => {
    it('addProjectAdminFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_PROJECT_ADMIN_FAIL
      }
      expect(actions.addProjectAdminFail()).toEqual(expectedResult)
    })
  })
  describe('deleteProjectAdmin', () => {
    it('deleteProjectAdmin should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_PROJECT_ADMIN,
        payload: {
          id: projectId,
          relationId,
          resolve
        }
      }
      expect(
        actions.deleteProjectAdmin(projectId, relationId, resolve)
      ).toEqual(expectedResult)
    })
  })
  describe('projectAdminDeleted', () => {
    it('projectAdminDeleted should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_PROJECT_ADMIN_SUCCESS,
        payload: { result: project }
      }
      expect(actions.projectAdminDeleted(project)).toEqual(expectedResult)
    })
  })
  describe('deleteProjectAdminFail', () => {
    it('deleteProjectAdminFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_PROJECT_ADMIN_FAIL
      }
      expect(actions.deleteProjectAdminFail()).toEqual(expectedResult)
    })
  })
  describe('addProjectRole', () => {
    it('addProjectRole should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_PROJECT_ROLE,
        payload: {
          projectId,
          roleIds: adminIds,
          resolve
        }
      }
      expect(actions.addProjectRole(projectId, adminIds, resolve)).toEqual(
        expectedResult
      )
    })

  })
  describe('projectRoleAdded', () => {
    it('projectRoleAdded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_PROJECT_ROLE_SUCCESS,
        payload: { result: project }
      }
      expect(actions.projectRoleAdded(project)).toEqual(expectedResult)
    })
  })
  describe('addProjectRoleFail', () => {
    it('addProjectRoleFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_PROJECT_ROLE_FAIL
      }
      expect(actions.addProjectRoleFail()).toEqual(expectedResult)
    })
  })
  describe('deleteProjectRole', () => {
    it('deleteProjectRole should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_PROJECT_ROLE,
        payload: {
          id: projectId,
          relationId,
          resolve
        }
      }
      expect(actions.deleteProjectRole(projectId, relationId, resolve)).toEqual(
        expectedResult
      )
    })
  })
  describe('projectRoleDeleted', () => {
    it('projectRoleDeleted should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_PROJECT_ROLE_SUCCESS,
        payload: { result: project }
      }
      expect(actions.projectRoleDeleted(project)).toEqual(expectedResult)
    })
  })
  describe('deleteProjectRoleFail', () => {
    it('deleteProjectRoleFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_PROJECT_ROLE_FAIL
      }
      expect(actions.deleteProjectRoleFail()).toEqual(expectedResult)
    })
  })
  describe('updateRelRoleProject', () => {
    it('updateRelRoleProject should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.UPDATE_RELATION_ROLE_PROJECT,
        payload: {
          roleId: relationId,
          projectId,
          projectRole: adminIds
        }
      }
      expect(
        actions.updateRelRoleProject(relationId, projectId, adminIds)
      ).toEqual(expectedResult)
    })
  })
  describe('relRoleProjectUpdated', () => {
    it('relRoleProjectUpdated should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.UPDATE_RELATION_ROLE_PROJECT_SUCCESS,
        payload: { result: project }
      }
      expect(actions.relRoleProjectUpdated(project)).toEqual(expectedResult)
    })
  })
  describe('updateRelRoleProjectFail', () => {
    it('updateRelRoleProjectFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.UPDATE_RELATION_ROLE_PROJECT_FAIL
      }
      expect(actions.updateRelRoleProjectFail()).toEqual(expectedResult)
    })
  })
  describe('deleteRelRoleProject', () => {
    it('deleteRelRoleProject should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_RELATION_ROLE_PROJECT,
        payload: {
          roleId: relationId,
          projectId,
          resolve
        }
      }
      expect(
        actions.deleteRelRoleProject(relationId, projectId, resolve)
      ).toEqual(expectedResult)
    })
  })
  describe('relRoleProjectDeleted', () => {
    it('relRoleProjectDeleted should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_RELATION_ROLE_PROJECT_SUCCESS,
        payload: { result: project }
      }
      expect(actions.relRoleProjectDeleted(project)).toEqual(expectedResult)
    })
  })
  describe('deleteRelRoleProjectFail', () => {
    it('deleteRelRoleProjectFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_RELATION_ROLE_PROJECT_FAIL
      }
      expect(actions.deleteRelRoleProjectFail()).toEqual(expectedResult)
    })
  })
  describe('loadRelRoleProject', () => {
    it('loadRelRoleProject should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_RELATION_ROLE_PROJECT,
        payload: {
          id: projectId,
          roleId: relationId
        }
      }
      expect(actions.loadRelRoleProject(projectId, relationId)).toEqual(
        expectedResult
      )
    })
  })
  describe('relRoleProjectLoaded', () => {
    it('relRoleProjectLoaded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.RELATION_ROLE_PROJECT_LOADED,
        payload: {
          result: project
        }
      }
      expect(actions.relRoleProjectLoaded(project)).toEqual(expectedResult)
    })
  })
  describe('loadRelRoleProjectFail', () => {
    it('loadRelRoleProjectFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_RELATION_ROLE_PROJECT_FAIL
      }
      expect(actions.loadRelRoleProjectFail()).toEqual(expectedResult)
    })
  })
  describe('excludeRoles', () => {
    it('excludeRoles should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EXCLUDE_ROLES,
        payload: {
          type: 'roleType',
          id: relationId,
          resolve
        }
      }
      expect(actions.excludeRoles('roleType', relationId, resolve)).toEqual(
        expectedResult
      )
    })
  })
  describe('rolesExcluded', () => {
    it('rolesExcluded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EXCLUDE_ROLES_SUCCESS,
        payload: { result: project }
      }
      expect(actions.rolesExcluded(project)).toEqual(expectedResult)
    })
  })
  describe('excludeRolesFail', () => {
    it('excludeRolesFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EXCLUDE_ROLES_FAIL,
        payload: {
          err: 'err'
        }
      }
      expect(actions.excludeRolesFail('err')).toEqual(expectedResult)
    })
  })
})
