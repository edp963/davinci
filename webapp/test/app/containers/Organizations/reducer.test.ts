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
import reducer, { initialState } from 'app/containers/Organizations/reducer'
import actions from 'app/containers/Organizations/actions'
import { mockAnonymousAction } from 'test/utils/fixtures'
import { mockStore } from './fixtures'

describe('organizationReducer', () => {
  const {
    orgId,
    projects,
    orgProjects,
    organization,
    organizations,
    role,
    members,
    roles,
    memberId
  } = mockStore
  let state
  beforeEach(() => {
    state = initialState
  })

  it('should return the initial state', () => {
    expect(reducer(void 0, mockAnonymousAction)).toEqual(state)
  })

  it('should handle the organizationMemberDeleted action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      if (draft.currentOrganizationMembers) {
        draft.currentOrganizationMembers = draft.currentOrganizationMembers.filter(
          (d) => d.id !== orgId
        )
      }
    })
    expect(reducer(state, actions.organizationMemberDeleted(orgId))).toEqual(
      expectedResult
    )
  })

  it('should handle the organizationsProjectsLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.currentOrganizationProjects = orgProjects.list
      draft.currentOrganizationProjectsDetail = orgProjects
    })
    expect(
      reducer(state, actions.organizationsProjectsLoaded(orgProjects))
    ).toEqual(expectedResult)
  })

  it('should handle the organizationsMembersLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.currentOrganizationMembers = members.map((member) => {
        return {
          ...member,
          roles: 'loading'
        }
      })
    })
    expect(reducer(state, actions.organizationsMembersLoaded(members))).toEqual(
      expectedResult
    )
  })

  it('should handle the getRoleListByMemberIdFail action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      const mId = memberId
      if (draft.currentOrganizationMembers) {
        draft.currentOrganizationMembers = draft.currentOrganizationMembers.map(
          (member) =>
            member.user.id === mId ? { ...member, roles: undefined } : member
        )
      }
    })
    expect(
      reducer(state, actions.getRoleListByMemberIdFail('error', memberId))
    ).toEqual(expectedResult)
  })

  it('should handle the getRoleListByMemberIdSuccess action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      if (draft.currentOrganizationMembers) {
        draft.currentOrganizationMembers = draft.currentOrganizationMembers.map(
          (member) =>
            member.user.id === memberId ? { ...member, roles } : member
        )
      }
    })
    expect(
      reducer(state, actions.getRoleListByMemberIdSuccess(roles, memberId))
    ).toEqual(expectedResult)
  })

  it('should handle the organizationsRoleLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.currentOrganizationRole = role
    })
    expect(reducer(state, actions.organizationsRoleLoaded(role))).toEqual(
      expectedResult
    )
  })

  it('should handle the organizationsLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.organizations = organizations
    })
    expect(reducer(state, actions.organizationsLoaded(organizations))).toEqual(
      expectedResult
    )
  })

  it('should handle the organizationAdded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      if (draft.organizations) {
        draft.organizations.unshift(organization)
      } else {
        draft.organizations = [organization]
      }
    })
    expect(reducer(state, actions.organizationAdded(organization))).toEqual(
      expectedResult
    )
  })

  it('should handle the organizationEdited action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.organizations.splice(
        draft.organizations.findIndex((d) => d.id === organization.id),
        1,
        organization
      )
    })
    expect(reducer(state, actions.organizationEdited(organization))).toEqual(
      expectedResult
    )
  })

  it('should handle the organizationDeleted action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.organizations = draft.organizations.filter((d) => d.id !== orgId)
    })
    expect(reducer(state, actions.organizationDeleted(orgId))).toEqual(
      expectedResult
    )
  })

  it('should handle the loadOrganizationDetail action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.currentOrganizationLoading = true
    })
    expect(reducer(state, actions.loadOrganizationDetail(orgId))).toEqual(
      expectedResult
    )
  })

  it('should handle the organizationDetailLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.currentOrganizationLoading = false
      draft.currentOrganization = organization
    })
    expect(
      reducer(state, actions.organizationDetailLoaded(organization))
    ).toEqual(expectedResult)
  })

  it('should handle the roleAdded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.roleModalLoading = false
    })
    expect(reducer(state, actions.roleAdded(role))).toEqual(expectedResult)
  })

  it('should handle the addRoleFail action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.roleModalLoading = false
    })
    expect(reducer(state, actions.addRoleFail())).toEqual(expectedResult)
  })

  it('should handle the searchMember action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.inviteMemberfetching = true
    })
    expect(reducer(state, actions.searchMember('keyword'))).toEqual(
      expectedResult
    )
  })

  it('should handle the memberSearched action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.inviteMemberLists = members
      draft.inviteMemberfetching = false
    })
    expect(reducer(state, actions.memberSearched(members))).toEqual(
      expectedResult
    )
  })

  it('should handle the searchMemberFail action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.inviteMemberfetching = true
    })
    expect(reducer(state, actions.searchMemberFail())).toEqual(expectedResult)
  })

  it('should handle the setCurrentProject action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.projectDetail = orgProjects
    })
    expect(reducer(state, actions.setCurrentProject(orgProjects))).toEqual(
      expectedResult
    )
  })

  it('should handle the projectAdminLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.projectAdmins = projects
    })
    expect(reducer(state, actions.projectAdminLoaded(projects))).toEqual(
      expectedResult
    )
  })

  it('should handle the projectRolesLoaded action correctly', () => {
    const expectedResult = produce(state, (draft) => {
      draft.projectRoles = role
    })
    expect(reducer(state, actions.projectRolesLoaded(role))).toEqual(
      expectedResult
    )
  })
})
