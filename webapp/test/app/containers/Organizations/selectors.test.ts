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
  selectOrganization,
  makeSelectOrganizations,
  makeSelectCurrentOrganizations,
  makeSelectCurrentOrganizationProjects,
  makeSelectCurrentOrganizationProjectsDetail,
  makeSelectCurrentOrganizationRole,
  makeSelectCurrentOrganizationMembers,
  makeSelectInviteMemberList,
  makeSelectRoleModalLoading,
  makeSelectCurrentOrganizationProject,
  makeSelectCurrentOrganizationProjectAdmins,
  makeSelectCurrentOrganizationProjectRoles,
  makeSelectInviteMemberLoading
} from 'app/containers/Organizations/selectors'
import { initialState } from 'app/containers/Organizations/reducer'

const state = {
  organization: initialState
}

describe('selectProject', () => {
  it('should select the org state', () => {
    expect(selectOrganization(state)).toEqual(state.organization)
  })
})

describe('makeSelectProjects', () => {
  const orgSelector = makeSelectOrganizations()
  const currentOrgSelector = makeSelectCurrentOrganizations()
  const currentOrgProsSelector = makeSelectCurrentOrganizationProjects()
  const currentOrgProDetailSelector = makeSelectCurrentOrganizationProjectsDetail()
  const currentOrgRoleSelector = makeSelectCurrentOrganizationRole()
  const currentOrgMemberSelector = makeSelectCurrentOrganizationMembers()
  const inviteMemberSelector = makeSelectInviteMemberList()
  const modalLoadingSelector = makeSelectRoleModalLoading()
  const currentOrgProSelector = makeSelectCurrentOrganizationProject()
  const currentOrgProAdminSelector = makeSelectCurrentOrganizationProjectAdmins()
  const currentOrgProRolesSelector = makeSelectCurrentOrganizationProjectRoles()
  const inviteMemberLoadingSelector = makeSelectInviteMemberLoading()

  it('should select the orgSelector', () => {
    expect(orgSelector(state)).toEqual(state.organization.organizations)
  })

  it('should select the currentOrgSelector', () => {
    expect(currentOrgSelector(state)).toEqual(
      state.organization.currentOrganization
    )
  })

  it('should select the currentOrgProsSelector', () => {
    expect(currentOrgProsSelector(state)).toEqual(
      state.organization.organizations
    )
  })

  it('should select the currentOrgProDetailSelector', () => {
    expect(currentOrgProDetailSelector(state)).toEqual(
      state.organization.currentOrganizationProjectsDetail
    )
  })

  it('should select the currentOrgRoleSelector', () => {
    expect(currentOrgRoleSelector(state)).toEqual(
      state.organization.currentOrganizationRole
    )
  })

  it('should select the currentOrgMemberSelector', () => {
    expect(currentOrgMemberSelector(state)).toEqual(
      state.organization.currentOrganizationMembers
    )
  })

  it('should select the inviteMemberSelector', () => {
    expect(inviteMemberSelector(state)).toEqual(
      state.organization.inviteMemberLists
    )
  })

  it('should select the modalLoadingSelector', () => {
    expect(modalLoadingSelector(state)).toEqual(
      state.organization.roleModalLoading
    )
  })

  it('should select the currentOrgProSelector', () => {
    expect(currentOrgProSelector(state)).toEqual(
      state.organization.projectDetail
    )
  })

  it('should select the currentOrgProAdminSelector', () => {
    expect(currentOrgProAdminSelector(state)).toEqual(
      state.organization.projectAdmins
    )
  })

  it('should select the currentOrgProRolesSelector', () => {
    expect(currentOrgProRolesSelector(state)).toEqual(
      state.organization.projectRoles
    )
  })

  it('should select the inviteMemberLoadingSelector', () => {
    expect(inviteMemberLoadingSelector(state)).toEqual(
      state.organization.inviteMemberfetching
    )
  })
})
