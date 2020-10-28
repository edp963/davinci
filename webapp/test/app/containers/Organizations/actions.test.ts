import { ActionTypes } from 'app/containers/Organizations/constants'
import actions from 'app/containers/Organizations/actions'
import { mockStore } from './fixtures'

describe('Organizations Actions', () => {
  const {
    orgId,
    projects,
    member,
    members,
    role,
    roles,
    resolve,
    organization,
    organizations
  } = mockStore
  describe('loadOrganizationProjects', () => {
    it(' loadOrganizationProjects should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_ORGANIZATIONS_PROJECTS,
        payload: {
          param: orgId
        }
      }
      expect(actions.loadOrganizationProjects(orgId)).toEqual(expectedResult)
    })
  })
  describe('organizationsProjectsLoaded', () => {
    it('organizationsProjectsLoaded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_ORGANIZATIONS_PROJECTS_SUCCESS,
        payload: {
          projects
        }
      }
      expect(actions.organizationsProjectsLoaded(projects)).toEqual(
        expectedResult
      )
    })
  })
  describe('loadOrganizationsProjectsFail', () => {
    it('loadOrganizationsProjectsFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_ORGANIZATIONS_PROJECTS_FAILURE
      }
      expect(actions.loadOrganizationsProjectsFail()).toEqual(expectedResult)
    })
  })
  describe('loadOrganizationMembers', () => {
    it('loadOrganizationMembers should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_ORGANIZATIONS_MEMBERS,
        payload: {
          id: orgId
        }
      }
      expect(actions.loadOrganizationMembers(orgId)).toEqual(expectedResult)
    })
  })
  describe('organizationsMembersLoaded', () => {
    it('organizationsMembersLoaded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_ORGANIZATIONS_MEMBERS_SUCCESS,
        payload: {
          members
        }
      }
      expect(actions.organizationsMembersLoaded(members)).toEqual(
        expectedResult
      )
    })
  })
  describe('loadOrganizationsMembersFail', () => {
    it('loadOrganizationsMembersFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_ORGANIZATIONS_MEMBERS_FAILURE
      }
      expect(actions.loadOrganizationsMembersFail()).toEqual(expectedResult)
    })
  })
  describe('loadOrganizationRole', () => {
    it('loadOrganizationRole should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_ORGANIZATIONS_ROLE,
        payload: {
          id: orgId
        }
      }
      expect(actions.loadOrganizationRole(orgId)).toEqual(expectedResult)
    })
  })
  describe('organizationsRoleLoaded', () => {
    it('organizationsRoleLoaded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_ORGANIZATIONS_ROLE_SUCCESS,
        payload: {
          role
        }
      }
      expect(actions.organizationsRoleLoaded(role)).toEqual(expectedResult)
    })
  })
  describe('loadOrganizationsRoleFail', () => {
    it('loadOrganizationsRoleFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_ORGANIZATIONS_ROLE_FAILURE,
        payload: {}
      }
      expect(actions.loadOrganizationsRoleFail()).toEqual(expectedResult)
    })
  })
  describe('loadOrganizations', () => {
    it('loadOrganizations should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_ORGANIZATIONS
      }
      expect(actions.loadOrganizations()).toEqual(expectedResult)
    })
  })
  describe('organizationsLoaded', () => {
    it('organizationsLoaded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_ORGANIZATIONS_SUCCESS,
        payload: {
          organizations
        }
      }
      expect(actions.organizationsLoaded(organizations)).toEqual(expectedResult)
    })
  })
  describe('loadOrganizationsFail', () => {
    it('loadOrganizationsFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_ORGANIZATIONS_FAILURE,
        payload: {}
      }
      expect(actions.loadOrganizationsFail()).toEqual(expectedResult)
    })
  })
  describe('addOrganization', () => {
    it('addOrganization should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_ORGANIZATION,
        payload: {
          organization,
          resolve
        }
      }
      expect(actions.addOrganization(organization, resolve)).toEqual(
        expectedResult
      )
    })
  })
  describe('organizationAdded', () => {
    it('organizationAdded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_ORGANIZATION_SUCCESS,
        payload: {
          result: organization
        }
      }
      expect(actions.organizationAdded(organization)).toEqual(expectedResult)
    })
  })
  describe('addOrganizationFail', () => {
    it('addOrganizationFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_ORGANIZATION_FAILURE,
        payload: {}
      }
      expect(actions.addOrganizationFail()).toEqual(expectedResult)
    })
  })
  describe('editOrganization', () => {
    it('editOrganization should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EDIT_ORGANIZATION,
        payload: { organization }
      }
      expect(actions.editOrganization(organization)).toEqual(expectedResult)
    })
  })
  describe('organizationEdited', () => {
    it('organizationEdited should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EDIT_ORGANIZATION_SUCCESS,
        payload: {
          result: organization
        }
      }
      expect(actions.organizationEdited(organization)).toEqual(expectedResult)
    })
  })
  describe('editOrganizationFail', () => {
    it('editOrganizationFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EDIT_ORGANIZATION_FAILURE,
        payload: {}
      }
      expect(actions.editOrganizationFail()).toEqual(expectedResult)
    })
  })
  describe('deleteOrganization', () => {
    it('deleteOrganization should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_ORGANIZATION,
        payload: {
          id: orgId,
          resolve
        }
      }
      expect(actions.deleteOrganization(orgId, resolve)).toEqual(expectedResult)
    })
  })
  describe('organizationDeleted', () => {
    it('organizationDeleted should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_ORGANIZATION_SUCCESS,
        payload: {
          id: orgId
        }
      }
      expect(actions.organizationDeleted(orgId)).toEqual(expectedResult)
    })
  })
  describe('deleteOrganizationFail', () => {
    it('deleteOrganizationFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_ORGANIZATION_FAILURE,
        payload: {}
      }
      expect(actions.deleteOrganizationFail()).toEqual(expectedResult)
    })
  })
  describe('loadOrganizationDetail', () => {
    it('loadOrganizationDetail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_ORGANIZATION_DETAIL,
        payload: {
          id: orgId
        }
      }
      expect(actions.loadOrganizationDetail(orgId)).toEqual(expectedResult)
    })
  })
  describe('organizationDetailLoaded', () => {
    it('organizationDetailLoaded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_ORGANIZATION_DETAIL_SUCCESS,
        payload: { organization }
      }
      expect(actions.organizationDetailLoaded(organization)).toEqual(
        expectedResult
      )
    })
  })
  describe('loadOrganizationDetailFail', () => {
    it('loadOrganizationDetailFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_ORGANIZATION_DETAIL_FAILURE,
        payload: {
          organization,
          widgets: ''
        }
      }
      expect(actions.loadOrganizationDetailFail(organization, '')).toEqual(
        expectedResult
      )
    })
  })
  describe('addRole', () => {
    it('addRole should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_ROLE,
        payload: {
          name: role.name,
          id: role.id,
          description: role.description,
          resolve
        }
      }
      expect(
        actions.addRole(role.name, role.description, role.id, resolve)
      ).toEqual(expectedResult)
    })
  })
  describe('roleAdded', () => {
    it('roleAdded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.ADD_ROLE_SUCCESS,
        payload: {
          result: role
        }
      }
      expect(actions.roleAdded(role)).toEqual(expectedResult)
    })
  })
  describe('addRoleFail', () => {
    it('addRoleFail should return the correct type', () => {
      const expectedResult = { type: ActionTypes.ADD_ROLE_FAILURE, payload: {} }
      expect(actions.addRoleFail()).toEqual(expectedResult)
    })
  })
  describe('deleteRole', () => {
    it('deleteRole should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_ROLE,
        payload: {
          id: orgId,
          resolve
        }
      }
      expect(actions.deleteRole(orgId, resolve)).toEqual(expectedResult)
    })
  })
  describe('roleDeleted', () => {
    it('roleDeleted should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_ROLE_SUCCESS,
        payload: {
          result: role
        }
      }
      expect(actions.roleDeleted(role)).toEqual(expectedResult)
    })
  })
  describe('deleteRoleFail', () => {
    it('deleteRoleFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_ROLE_FAILURE,
        payload: {}
      }
      expect(actions.deleteRoleFail()).toEqual(expectedResult)
    })
  })
  describe('editRole', () => {
    it('editRole should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EDIT_ROLE,
        payload: {
          name: role.name,
          id: role.id,
          description: role.description,
          resolve
        }
      }
      expect(
        actions.editRole(role.name, role.description, role.id, resolve)
      ).toEqual(expectedResult)
    })
  })
  describe('roleEdited', () => {
    it('roleEdited should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EDIT_ROLE_SUCCESS,
        payload: {
          result: role
        }
      }
      expect(actions.roleEdited(role)).toEqual(expectedResult)
    })
  })
  describe('editRoleFail', () => {
    it('editRoleFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.EDIT_ROLE_FAILURE,
        payload: {}
      }
      expect(actions.editRoleFail()).toEqual(expectedResult)
    })
  })
  describe('searchMember', () => {
    it('searchMember should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.SEARCH_MEMBER,
        payload: {
          keyword: ''
        }
      }
      expect(actions.searchMember('')).toEqual(expectedResult)
    })
  })
  describe('memberSearched', () => {
    it('memberSearched should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.SEARCH_MEMBER_SUCCESS,
        payload: {
          result: member
        }
      }
      expect(actions.memberSearched(member)).toEqual(expectedResult)
    })
  })
  describe('searchMemberFail', () => {
    it('searchMemberFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.SEARCH_MEMBER_FAILURE,
        payload: {}
      }
      expect(actions.searchMemberFail()).toEqual(expectedResult)
    })
  })
  describe('inviteMember', () => {
    it('inviteMember should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.INVITE_MEMBER,
        payload: {
          orgId,
          members,
          needEmail: false,
          resolve
        }
      }
      expect(actions.inviteMember(orgId, members, false, resolve)).toEqual(
        expectedResult
      )
    })
  })
  describe('inviteMemberSuccess', () => {
    it('inviteMemberSuccess should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.INVITE_MEMBER_SUCCESS,
        payload: {
          result: member
        }
      }
      expect(actions.inviteMemberSuccess(member)).toEqual(expectedResult)
    })
  })
  describe('inviteMemberFail', () => {
    it('inviteMemberFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.INVITE_MEMBER_FAILURE,
        payload: {}
      }
      expect(actions.inviteMemberFail()).toEqual(expectedResult)
    })
  })
  describe('deleteOrganizationMember', () => {
    it('deleteOrganizationMember should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_ORGANIZATION_MEMBER,
        payload: {
          relationId: orgId,
          resolve
        }
      }
      expect(actions.deleteOrganizationMember(orgId, resolve)).toEqual(
        expectedResult
      )
    })
  })
  describe('organizationMemberDeleted', () => {
    it('organizationMemberDeleted should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_ORGANIZATION_MEMBER_SUCCESS,
        payload: {
          id: orgId
        }
      }
      expect(actions.organizationMemberDeleted(orgId)).toEqual(expectedResult)
    })
  })
  describe('deleteOrganizationMemberFail', () => {
    it('deleteOrganizationMemberFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.DELETE_ORGANIZATION_MEMBER_ERROR,
        payload: {}
      }
      expect(actions.deleteOrganizationMemberFail()).toEqual(expectedResult)
    })
  })
  describe('changeOrganizationMemberRole', () => {
    it('changeOrganizationMemberRole should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.CHANGE_MEMBER_ROLE_ORGANIZATION,
        payload: {
          relationId: orgId,
          newRole: role,
          resolve
        }
      }
      expect(
        actions.changeOrganizationMemberRole(orgId, role, resolve)
      ).toEqual(expectedResult)
    })
  })
  describe('organizationMemberRoleChanged', () => {
    it('organizationMemberRoleChanged should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.CHANGE_MEMBER_ROLE_ORGANIZATION_SUCCESS,
        payload: {
          relationId: orgId,
          newRole: role
        }
      }
      expect(actions.organizationMemberRoleChanged(orgId, role)).toEqual(
        expectedResult
      )
    })
  })
  describe('changeOrganizationMemberRoleFail', () => {
    it('changeOrganizationMemberRoleFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.CHANGE_MEMBER_ROLE_ORGANIZATION_ERROR,
        payload: {}
      }
      expect(actions.changeOrganizationMemberRoleFail()).toEqual(expectedResult)
    })
  })
  describe('relRoleMember', () => {
    it('relRoleMember should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.REL_ROLE_MEMBER,
        payload: {
          id: orgId,
          memberIds: [1, 2],
          resolve
        }
      }
      expect(actions.relRoleMember(orgId, [1, 2], resolve)).toEqual(
        expectedResult
      )
    })
  })
  describe('relRoleMemberSuccess', () => {
    it('relRoleMemberSuccess should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.REL_ROLE_MEMBER_SUCCESS,
        payload: {}
      }
      expect(actions.relRoleMemberSuccess()).toEqual(expectedResult)
    })
  })
  describe('relRoleMemberFail', () => {
    it('relRoleMemberFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.REL_ROLE_MEMBER_FAILURE,
        payload: {}
      }
      expect(actions.relRoleMemberFail()).toEqual(expectedResult)
    })
  })
  describe('getRelRoleMember', () => {
    it('getRelRoleMember should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.GET_REL_ROLE_MEMBER,
        payload: {
          id: orgId,
          resolve
        }
      }
      expect(actions.getRelRoleMember(orgId, resolve)).toEqual(expectedResult)
    })
  })
  describe('getRelRoleMemberSuccess', () => {
    it('getRelRoleMemberSuccess should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.GET_REL_ROLE_MEMBER_SUCCESS,
        payload: {}
      }
      expect(actions.getRelRoleMemberSuccess()).toEqual(expectedResult)
    })
  })
  describe('getRelRoleMemberFail', () => {
    it('getRelRoleMemberFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.GET_REL_ROLE_MEMBER_FAILURE,
        payload: {}
      }
      expect(actions.getRelRoleMemberFail()).toEqual(expectedResult)
    })
  })
  describe('setCurrentProject', () => {
    it('setCurrentProject should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.SET_CURRENT_ORIGANIZATION_PROJECT,
        payload: {
          option: {}
        }
      }
      expect(actions.setCurrentProject({})).toEqual(expectedResult)
    })
  })
  describe('loadProjectAdmin', () => {
    it('loadProjectAdmin should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_PROJECT_ADMINS,
        payload: {
          projectId: orgId
        }
      }
      expect(actions.loadProjectAdmin(orgId)).toEqual(expectedResult)
    })
  })
  describe('projectAdminLoaded', () => {
    it('projectAdminLoaded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_PROJECT_ADMINS_SUCCESS,
        payload: {
          result: projects
        }
      }
      expect(actions.projectAdminLoaded(projects)).toEqual(expectedResult)
    })
  })
  describe('loadProjectAdminFail', () => {
    it('loadProjectAdminFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_PROJECT_ADMINS_FAIL,
        payload: {}
      }
      expect(actions.loadProjectAdminFail()).toEqual(expectedResult)
    })
  })
  describe('loadProjectRoles', () => {
    it('loadProjectRoles should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_PROJECT_ROLES,
        payload: {
          projectId: orgId
        }
      }
      expect(actions.loadProjectRoles(orgId)).toEqual(expectedResult)
    })
  })
  describe('projectRolesLoaded', () => {
    it('projectRolesLoaded should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_PROJECT_ROLES_SUCCESS,
        payload: {
          result: roles
        }
      }
      expect(actions.projectRolesLoaded(roles)).toEqual(expectedResult)
    })
  })
  describe('loadProjectRolesFail', () => {
    it('loadProjectRolesFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.LOAD_PROJECT_ROLES_FAIL,
        payload: {}
      }
      expect(actions.loadProjectRolesFail()).toEqual(expectedResult)
    })
  })
  describe('getVizVisbility', () => {
    it('getVizVisbility should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.GET_VIZ_VISBILITY,
        payload: {
          roleId: orgId,
          projectId: orgId,
          resolve
        }
      }
      expect(actions.getVizVisbility(orgId, orgId, resolve)).toEqual(
        expectedResult
      )
    })
  })
  describe('postVizVisbility', () => {
    it('postVizVisbility should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.POST_VIZ_VISBILITY,
        payload: {
          id: orgId,
          resolve,
          permission: []
        }
      }
      expect(actions.postVizVisbility(orgId, [], resolve)).toEqual(
        expectedResult
      )
    })
  })
  describe('getRoleListByMemberId', () => {
    it('getRoleListByMemberId should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.GET_ROLELISTS_BY_MEMBERID,
        payload: {
          orgId,
          memberId: orgId,
          resolve
        }
      }
      expect(actions.getRoleListByMemberId(orgId, orgId, resolve)).toEqual(
        expectedResult
      )
    })
  })
  describe('getRoleListByMemberIdSuccess', () => {
    it('getRoleListByMemberIdSuccess should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.GET_ROLELISTS_BY_MEMBERID_SUCCESS,
        payload: {
          result: member,
          memberId: orgId
        }
      }
      expect(actions.getRoleListByMemberIdSuccess(member, orgId)).toEqual(
        expectedResult
      )
    })
  })
  describe('getRoleListByMemberIdFail', () => {
    it('getRoleListByMemberIdFail should return the correct type', () => {
      const expectedResult = {
        type: ActionTypes.GET_ROLELISTS_BY_MEMBERID_ERROR,
        payload: {
          error: 'error',
          memberId: orgId
        }
      }
      expect(actions.getRoleListByMemberIdFail('error', orgId)).toEqual(
        expectedResult
      )
    })
  })
})
