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

import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import request from 'app/utils/request'
import actions from 'app/containers/Projects/actions'
import OrgActions from 'app/containers/Organizations/actions'
import {
  getProjects,
  addProject,
  editProject,
  deleteProject,
  addProjectAdmin,
  addProjectRole,
  transferProject,
  searchProject,
  unStarProject,
  getProjectStarUser,
  getCollectProjects,
  editCollectProject,
  loadRelRoleProject,
  updateRelRoleProject,
  deleteRelRoleProject,
  getProjectRoles,
  excludeRole
} from 'app/containers/Projects/sagas'
import { mockStore } from './fixtures'
import { getMockResponse } from 'test/utils/fixtures'

describe('Projects Sagas', () => {
  const { projects, project, projectId } = mockStore
  describe('getProjects Saga', () => {
    it('should dispatch the projectsLoaded action if it requests the data successfully', () => {
      return expectSaga(getProjects, actions.loadProjects())
        .provide([[matchers.call.fn(request), getMockResponse(projects)]])
        .put(actions.projectsLoaded(projects))
        .run()
    })

    it('should call the loadProjectsFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(getProjects, actions.loadProjects())
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.loadProjectsFail())
        .run()
    })
  })

  describe('addProjects Saga', () => {
    const addProjectActions = actions.addProject(project, () => void 0)
    it('should dispatch the projectAdded action if it requests the data successfully', () => {
      return expectSaga(addProject, addProjectActions)
        .provide([[matchers.call.fn(request), getMockResponse(project)]])
        .put(actions.projectAdded(project))
        .run()
    })

    it('should call the addProjectFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(addProject, addProjectActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.addProjectFail())
        .run()
    })
  })

  describe('editProjects Saga', () => {
    const editProjectActions = actions.editProject(project, () => void 0)
    it('should dispatch the projectEdited action if it requests the data successfully', () => {
      return expectSaga(editProject, editProjectActions)
        .provide([[matchers.call.fn(request), getMockResponse(project)]])
        .put(actions.projectEdited(project))
        .run()
    })

    it('should call the editProjectFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(editProject, editProjectActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.editProjectFail())
        .run()
    })
  })

  describe('deleteProjects Saga', () => {
    const deleteProjectActions = actions.deleteProject(projectId, () => void 0)
    it('should dispatch the projectDeleted action if it requests the data successfully', () => {
      return expectSaga(deleteProject, deleteProjectActions)
        .provide([[matchers.call.fn(request), getMockResponse(project)]])
        .put(actions.projectDeleted(projectId))
        .run()
    })

    it('should call the deleteProjectFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(deleteProject, deleteProjectActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.deleteProjectFail())
        .run()
    })
  })

  describe('addProjectAdmin Saga', () => {
    const addProjectAdminActions = actions.addProjectAdmin(
      projectId,
      projectId,
      () => void 0
    )
    it('should call the addProjectAdminFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(addProjectAdmin, addProjectAdminActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.addProjectFail())
        .run()
    })
  })

  describe('addProjectRole Saga', () => {
    const addProjectRoleActions = actions.addProjectRole(
      projectId,
      [projectId],
      () => void 0
    )
    it('should call the addProjectRoleFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(addProjectRole, addProjectRoleActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.addProjectRoleFail())
        .run()
    })
  })

  describe('transferProject Saga', () => {
    const transferProjectActions = actions.transferProject(projectId, projectId)
    it('should dispatch the projectTransfered action if it requests the data successfully', () => {
      return expectSaga(transferProject, transferProjectActions)
        .provide([[matchers.call.fn(request), getMockResponse(project)]])
        .put(actions.projectTransfered(project))
        .run()
    })

    it('should call the transferProjectFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(transferProject, transferProjectActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.transferProjectFail())
        .run()
    })
  })

  describe('searchProject Saga', () => {
    const [keywords, pageNum, pageSize] = ['abc', 1, 20]
    const transferProjectActions = actions.searchProject({keywords, pageNum, pageSize})
    it('should dispatch the projectSearched action if it requests the data successfully', () => {
      return expectSaga(searchProject, transferProjectActions)
        .provide([[matchers.call.fn(request), getMockResponse(project)]])
        .put(actions.projectSearched(project))
        .run()
    })

    it('should call the searchProjectFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(searchProject, transferProjectActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.searchProjectFail())
        .run()
    })
  })



  describe('unStarProject Saga', () => {
    const transferProjectActions = actions.unStarProject(projectId, () => void 0)
    it('should dispatch the unStarProjectSuccess action if it requests the data successfully', () => {
      return expectSaga(unStarProject, transferProjectActions)
        .provide([[matchers.call.fn(request), getMockResponse(project)]])
        .put(actions.unStarProjectSuccess(project))
        .run()
    })

    it('should call the unStarProjectFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(unStarProject, transferProjectActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.unStarProjectFail())
        .run()
    })
  })

  describe('getProjectStarUser Saga', () => {
    const getProjectStarUserActions = actions.getProjectStarUser(projectId)
    it('should dispatch the getProjectStarUserSuccess action if it requests the data successfully', () => {
      return expectSaga(getProjectStarUser, getProjectStarUserActions)
        .provide([[matchers.call.fn(request), getMockResponse(project)]])
        .put(actions.getProjectStarUserSuccess(project))
        .run()
    })

    it('should call the getProjectStarUserFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(getProjectStarUser, getProjectStarUserActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.getProjectStarUserFail())
        .run()
    })
  })


  describe('getCollectProjects Saga', () => {
    it('should dispatch the collectProjectLoaded action if it requests the data successfully', () => {
      return expectSaga(getCollectProjects)
        .provide([[matchers.call.fn(request), getMockResponse(project)]])
        .put(actions.collectProjectLoaded(project))
        .run()
    })

    it('should call the collectProjectFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(getCollectProjects)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.collectProjectFail())
        .run()
    })
  })

  describe('editCollectProject Saga', () => {
    const [
    isFavorite,
    proId,
    resolve] = [false, projectId, () => void 0]
    const clickCollectProjectsActions = actions.clickCollectProjects(isFavorite, proId, resolve)

    it('should dispatch the collectProjectClicked action if it requests the data successfully', () => {
      return expectSaga(editCollectProject, clickCollectProjectsActions)
        .provide([[matchers.call.fn(request), getMockResponse(project)]])
        .put(actions.collectProjectClicked({isFavorite, proId, resolve}))
        .run()
    })

    it('should call the clickCollectProjectFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(editCollectProject, clickCollectProjectsActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.clickCollectProjectFail())
        .run()
    })
  })


  describe('loadRelRoleProject Saga', () => {
    const loadRelRoleProjectsActions = actions.loadRelRoleProject(
      projectId,
      projectId
    )

    it('should dispatch the relRoleProjectLoaded action if it requests the data successfully', () => {
      return expectSaga(loadRelRoleProject, loadRelRoleProjectsActions)
        .provide([[matchers.call.fn(request), getMockResponse(project)]])
        .put(actions.relRoleProjectLoaded(project))
        .run()
    })

    it('should call the loadRelRoleProjectFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(loadRelRoleProject, loadRelRoleProjectsActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.loadRelRoleProjectFail())
        .run()
    })
  })


  describe('updateRelRoleProject Saga', () => {
    const loadRelRoleProjectsActions = actions.updateRelRoleProject(
      projectId,
      projectId,
      project
    )

    it('should dispatch the relRoleProjectUpdated action if it requests the data successfully', () => {
      return expectSaga(updateRelRoleProject, loadRelRoleProjectsActions)
        .provide([[matchers.call.fn(request), getMockResponse(project)]])
        .put(actions.relRoleProjectUpdated(project))
        .run()
    })

    it('should call the updateRelRoleProjectFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(updateRelRoleProject, loadRelRoleProjectsActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.updateRelRoleProjectFail())
        .run()
    })

  })


  describe('deleteRelRoleProject Saga', () => {
    const deleteRelRoleProjectsActions = actions.deleteRelRoleProject(
      projectId,
      projectId,
      () => void 0
    )

    it('should dispatch the relRoleProjectDeleted action if it requests the data successfully', () => {
      return expectSaga(deleteRelRoleProject, deleteRelRoleProjectsActions)
        .provide([[matchers.call.fn(request), getMockResponse(project)]])
        .put(actions.relRoleProjectDeleted(project))
        .run()
    })

    it('should call the deleteRelRoleProjectFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(deleteRelRoleProject, deleteRelRoleProjectsActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.deleteRelRoleProjectFail())
        .run()
    })

  })


  describe('getProjectRoles Saga', () => {
    const loadProjectRolesActions = OrgActions.loadProjectRoles(
      projectId
    )

    it('should dispatch the projectRolesLoaded action if it requests the data successfully', () => {
      return expectSaga(getProjectRoles, loadProjectRolesActions)
        .provide([[matchers.call.fn(request), getMockResponse(project)]])
        .put(OrgActions.projectRolesLoaded(project))
        .run()
    })

    it('should call the loadProjectRolesFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(getProjectRoles, loadProjectRolesActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(OrgActions.loadProjectRolesFail())
        .run()
    })

  })


  describe('excludeRole Saga', () => {
    const excludeRolesFailActions = actions.excludeRoles(
      projectId,
      'type',
      () => void 0
    )

    it('should dispatch the rolesExcluded action if it requests the data successfully', () => {
      return expectSaga(excludeRole, excludeRolesFailActions)
        .provide([[matchers.call.fn(request), getMockResponse(project)]])
        .put(actions.rolesExcluded(project))
        .run()
    })

    it('should call the excludeRolesFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(excludeRole, excludeRolesFailActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.excludeRolesFail(errors))
        .run()
    })

  })

})
