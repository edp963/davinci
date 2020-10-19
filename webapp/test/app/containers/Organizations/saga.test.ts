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
import actions from 'app/containers/Organizations/actions'
import {
  getOrganizations,
  addOrganization,
  editOrganization,
  deleteOrganization,
  getOrganizationDetail,
  getOrganizationsProjects,
  getOrganizationsMembers,
  getOrganizationsRole,
  addRole,
  getRoleListByMemberId,
  deleteRole,
  editRole,
  relRoleMember,
  getRelRoleMember,
  searchMember,
  inviteMember,
  deleteOrganizationMember,
  changeOrganizationMemberRole,
  getProjectAdmins,
  getVizVisbility,
  postVizVisbility
} from 'app/containers/Organizations/sagas'
import { mockStore } from './fixtures'
import { getMockResponse } from 'test/utils/fixtures'

describe('Organizations Sagas', () => {
  const { projects, organization, orgId, organizations, roles, role, member, members } = mockStore
  describe('getOrganizations Saga', () => {
    it('should dispatch the organizationsLoaded action if it requests the data successfully', () => {
      return expectSaga(getOrganizations)
        .provide([[matchers.call.fn(request), getMockResponse(projects)]])
        .put(actions.organizationsLoaded(projects))
        .run()
    })

    it('should call the loadOrganizationsFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(getOrganizations)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.loadOrganizationsFail())
        .run()
    })
  })

  describe('addOrganization Saga', () => {
    const addOrganizationActions = actions.addOrganization(organization, () => void 0)
    it('should dispatch the organizationAdded action if it requests the data successfully', () => {
      return expectSaga(addOrganization, addOrganizationActions)
        .provide([[matchers.call.fn(request), getMockResponse(projects)]])
        .put(actions.organizationAdded(projects))
        .run()
    })

    it('should call the addOrganizationFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(addOrganization, addOrganizationActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.addOrganizationFail())
        .run()
    })

  })

  describe('editOrganization Saga', () => {
    const editOrganizationActions = actions.editOrganization(organization)
    it('should dispatch the organizationEdited action if it requests the data successfully', () => {
      return expectSaga(editOrganization, editOrganizationActions)
        .provide([[matchers.call.fn(request), getMockResponse(organization)]])
        .put(actions.organizationEdited(organization))
        .run()
    })

    it('should call the editOrganizationFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(editOrganization, editOrganizationActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.editOrganizationFail())
        .run()
    })

  })

  describe('deleteOrganization Saga', () => {
    const deleteOrganizationActions = actions.deleteOrganization(orgId, () => void 0)
    it('should dispatch the organizationDeleted action if it requests the data successfully', () => {
      return expectSaga(deleteOrganization, deleteOrganizationActions)
        .provide([[matchers.call.fn(request), getMockResponse(organization)]])
        .put(actions.organizationDeleted(orgId))
        .run()
    })

    it('should call the deleteOrganizationFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(deleteOrganization, deleteOrganizationActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.deleteOrganizationFail())
        .run()
    })

  })

  describe('getOrganizationDetail Saga', () => {
    const loadOrganizationDetailActions = actions.loadOrganizationDetail(orgId)
    it('should dispatch the organizationDetailLoaded action if it requests the data successfully', () => {
      return expectSaga(getOrganizationDetail, loadOrganizationDetailActions)
        .provide([[matchers.call.fn(request), getMockResponse(organization)]])
        .put(actions.organizationDetailLoaded(organization))
        .run()
    })
  })

  describe('getOrganizationsProjects Saga', () => {
    const [id, keyword, pageNum, pageSize] = [orgId, 'password', 1, 20]
    const loadOrganizationProjectsActions = actions.loadOrganizationProjects({id, keyword, pageNum, pageSize})
    it('should dispatch the organizationsProjectsLoaded action if it requests the data successfully', () => {
      return expectSaga(getOrganizationsProjects, loadOrganizationProjectsActions)
        .provide([[matchers.call.fn(request), getMockResponse(organizations)]])
        .put(actions.organizationsProjectsLoaded(organizations))
        .run()
    })

    it('should call the loadOrganizationsProjectsFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(getOrganizationsProjects, loadOrganizationProjectsActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.loadOrganizationsProjectsFail())
        .run()
    })

  })

  describe('getOrganizationsMembers Saga', () => {
    const loadOrganizationMembersActions = actions.loadOrganizationMembers(orgId)
    it('should dispatch the organizationsMembersLoaded action if it requests the data successfully', () => {
      return expectSaga(getOrganizationsMembers, loadOrganizationMembersActions)
        .provide([[matchers.call.fn(request), getMockResponse(organizations)]])
        .put(actions.organizationsMembersLoaded(organizations))
        .run()
    })

    it('should call the loadOrganizationsMembersFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(getOrganizationsMembers, loadOrganizationMembersActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.loadOrganizationsMembersFail())
        .run()
    })

  })

  describe('getOrganizationsMembers Saga', () => {
    const loadOrganizationRoleActions = actions.loadOrganizationRole(orgId)
    it('should dispatch the organizationsRoleLoaded action if it requests the data successfully', () => {
      return expectSaga(getOrganizationsRole, loadOrganizationRoleActions)
        .provide([[matchers.call.fn(request), getMockResponse(organizations)]])
        .put(actions.organizationsRoleLoaded(organizations))
        .run()
    })

    it('should call the loadOrganizationsRoleFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(getOrganizationsRole, loadOrganizationRoleActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.loadOrganizationsRoleFail())
        .run()
    })

  })

  describe('addRole Saga', () => {
    const [name, description, id, resolve] = ['name', 'desc', orgId, () => void 0]
    const loadOrganizationRoleActions = actions.addRole(name, description, id, resolve)
    it('should dispatch the roleAdded action if it requests the data successfully', () => {
      return expectSaga(addRole, loadOrganizationRoleActions)
        .provide([[matchers.call.fn(request), getMockResponse(roles)]])
        .put(actions.roleAdded(roles))
        .run()
    })

    it('should call the addRoleFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(addRole, loadOrganizationRoleActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.addRoleFail())
        .run()
    })

  })

  describe('getRoleListByMemberId Saga', () => {
    const [memberId, orgId, resolve] = [1, 1, () => void 0]
    const loadOrganizationRoleActions = actions.getRoleListByMemberId(memberId, orgId, resolve)
    it('should dispatch the getRoleListByMemberIdSuccess action if it requests the data successfully', () => {
      return expectSaga(getRoleListByMemberId, loadOrganizationRoleActions)
        .provide([[matchers.call.fn(request), getMockResponse(roles)]])
        .put(actions.getRoleListByMemberIdSuccess(roles, memberId))
        .run()
    })

    it('should call the getRoleListByMemberIdFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(getRoleListByMemberId, loadOrganizationRoleActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.getRoleListByMemberIdFail(errors, memberId))
        .run()
    })

  })

  describe('deleteRole Saga', () => {
    const [id, resolve ] = [1, () => void 0]
    const loadOrganizationRoleActions = actions.deleteRole(id, resolve)
    it('should dispatch the roleDeleted action if it requests the data successfully', () => {
      return expectSaga(deleteRole, loadOrganizationRoleActions)
        .provide([[matchers.call.fn(request), getMockResponse(role)]])
        .put(actions.roleDeleted(role))
        .run()
    })

    it('should call the deleteRoleFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(deleteRole, loadOrganizationRoleActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.deleteRoleFail())
        .run()
    })

  })

  describe('editRole Saga', () => {
    const [name, description, id, resolve] = ['name', 'desc', 1, () => void 0]
    const editRoleActions = actions.editRole(name, description, id, resolve)
    it('should dispatch the roleEdited action if it requests the data successfully', () => {
      return expectSaga(editRole, editRoleActions)
        .provide([[matchers.call.fn(request), getMockResponse(role)]])
        .put(actions.roleEdited(role))
        .run()
    })

    it('should call the editRoleFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(editRole, editRoleActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.editRoleFail())
        .run()
    })

  })



  describe('relRoleMember Saga', () => {
    const [id, memberIds, resolve] = [ 1, [1], () => void 0]
    const relRoleMemberActions = actions.relRoleMember(id, memberIds, resolve)
    it('should dispatch the relRoleMemberSuccess action if it requests the data successfully', () => {
      return expectSaga(relRoleMember, relRoleMemberActions)
        .provide([[matchers.call.fn(request), getMockResponse(role)]])
        .put(actions.relRoleMemberSuccess())
        .run()
    })

    it('should call the relRoleMemberFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(relRoleMember, relRoleMemberActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.relRoleMemberFail())
        .run()
    })

  })


  describe('relRoleMember Saga', () => {
    const [id, resolve] = [ 1, () => void 0]
    const getRelRoleMemberActions = actions.getRelRoleMember(id, resolve)
    it('should dispatch the getRelRoleMemberSuccess action if it requests the data successfully', () => {
      return expectSaga(getRelRoleMember, getRelRoleMemberActions)
        .provide([[matchers.call.fn(request), getMockResponse(role)]])
        .put(actions.getRelRoleMemberSuccess())
        .run()
    })

    it('should call the getRelRoleMemberFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(getRelRoleMember, getRelRoleMemberActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.getRelRoleMemberFail())
        .run()
    })

  })



  describe('searchMember Saga', () => {
    const searchMemberActions = actions.searchMember('keywords')
    it('should dispatch the memberSearched action if it requests the data successfully', () => {
      return expectSaga(searchMember, searchMemberActions)
        .provide([[matchers.call.fn(request), getMockResponse(member)]])
        .put(actions.memberSearched(member))
        .run()
    })

    it('should call the searchMemberFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(searchMember, searchMemberActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.searchMemberFail())
        .run()
    })

  })


  describe('inviteMember Saga', () => {
    const [ orgId, members, needEmail, resolve] = [1, [member], false, () => void 0 ]
    const inventMemberActions = actions.inviteMember(orgId, members, needEmail, resolve)
    it('should dispatch the inviteMemberSuccess action if it requests the data successfully', () => {
      return expectSaga(inviteMember, inventMemberActions)
        .provide([[matchers.call.fn(request), getMockResponse(member)]])
        .put(actions.inviteMemberSuccess(member))
        .run()
    })

    it('should call the inviteMemberFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(inviteMember, inventMemberActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.inviteMemberFail())
        .run()
    })

  })


  describe('deleteOrganizationMember Saga', () => {
    const [ relationId, resolve] = [1, () => void 0 ]
    const deleteOrganizationMemberActions = actions.deleteOrganizationMember(relationId, resolve)
    it('should dispatch the organizationMemberDeleted action if it requests the data successfully', () => {
      return expectSaga(deleteOrganizationMember, deleteOrganizationMemberActions)
        .provide([[matchers.call.fn(request), getMockResponse(relationId)]])
        .put(actions.organizationMemberDeleted(relationId))
        .run()
    })

    it('should call the deleteOrganizationMemberFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(deleteOrganizationMember, deleteOrganizationMemberActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.deleteOrganizationMemberFail())
        .run()
    })

  })

  describe('changeOrganizationMemberRole Saga', () => {
    const [ relationId, newRole, resolve ] = [1, role, () => void 0 ]
    const changeOrganizationMemberRoleActions = actions.changeOrganizationMemberRole(relationId, newRole, resolve)
    it('should dispatch the organizationMemberRoleChanged action if it requests the data successfully', () => {
      return expectSaga(changeOrganizationMemberRole, changeOrganizationMemberRoleActions)
        .provide([[matchers.call.fn(request), getMockResponse(member)]])
        .put(actions.organizationMemberRoleChanged(relationId, member))
        .run()
    })

    it('should call the changeOrganizationMemberRoleFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(changeOrganizationMemberRole, changeOrganizationMemberRoleActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.changeOrganizationMemberRoleFail())
        .run()
    })

  })

  describe('getProjectAdmins Saga', () => {
    const changeOrganizationMemberRoleActions = actions.loadProjectAdmin(orgId)
    it('should dispatch the projectAdminLoaded action if it requests the data successfully', () => {
      return expectSaga(getProjectAdmins, changeOrganizationMemberRoleActions)
        .provide([[matchers.call.fn(request), getMockResponse(members)]])
        .put(actions.projectAdminLoaded(members))
        .run()
    })

    it('should call the loadProjectAdminFail action if the response errors', () => {
      const errors = new Error('error')
      return expectSaga(getProjectAdmins, changeOrganizationMemberRoleActions)
        .provide([[matchers.call.fn(request), throwError(errors)]])
        .put(actions.loadProjectAdminFail())
        .run()
    })

  })


  describe('getVizVisbility Saga', () => {
    const [roleId, projectId, resolve] = [ orgId, orgId, () => void 0]
    const getVizVisbilityActions = actions.getVizVisbility(roleId, projectId, resolve)
    it('should dispatch the getVizVisbilitySaga action if it requests the data successfully', () => {
      return expectSaga(getVizVisbility, getVizVisbilityActions)
        .provide([[matchers.call.fn(request), getMockResponse({})]])
        .run()
    })

  })


  describe('postVizVisbility Saga', () => {
    const [id, permission, resolve] = [ orgId, {}, () => void 0]
    const postVizVisbilityActions = actions.postVizVisbility(id, permission, resolve)
    it('should dispatch the postVizVisbilityActions action if it requests the data successfully', () => {
      return expectSaga(getVizVisbility, postVizVisbilityActions)
        .provide([[matchers.call.fn(request), getMockResponse({})]])
        .run()
    })

  })
})
