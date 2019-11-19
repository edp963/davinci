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

import { createSelector } from 'reselect'
import { IOrganizationState } from './types'

const selectOrganization = (state) => state.organization

const makeSelectOrganizations = () => createSelector(
  selectOrganization,
  (organizationState: IOrganizationState) => organizationState.organizations
)

const makeSelectInviteMemberList = () => createSelector(
  selectOrganization,
  (organizationState: IOrganizationState) => organizationState.inviteMemberLists
)

const makeSelectCurrentOrganizations = () => createSelector(
  selectOrganization,
  (organizationState: IOrganizationState) => organizationState.currentOrganization
)

const makeSelectCurrentOrganizationProjects = () => createSelector(
  selectOrganization,
  (organizationState: IOrganizationState) => organizationState.currentOrganizationProjects
)

const makeSelectCurrentOrganizationProjectsDetail = () => createSelector(
  selectOrganization,
  (organizationState: IOrganizationState) => organizationState.currentOrganizationProjectsDetail
)

const makeSelectCurrentOrganizationRole = () => createSelector(
  selectOrganization,
  (organizationState: IOrganizationState) => organizationState.currentOrganizationRole
)

const makeSelectCurrentOrganizationMembers = () => createSelector(
  selectOrganization,
  (organizationState: IOrganizationState) => organizationState.currentOrganizationMembers
)

const makeSelectRoleModalLoading = () => createSelector(
  selectOrganization,
  (organizationState: IOrganizationState) => organizationState.roleModalLoading
)

const makeSelectCurrentOrganizationProject = () => createSelector(
  selectOrganization,
  (organizationState: IOrganizationState) => organizationState.projectDetail
)

const makeSelectCurrentOrganizationProjectAdmins = () => createSelector(
  selectOrganization,
  (organizationState: IOrganizationState) => organizationState.projectAdmins
)

const makeSelectCurrentOrganizationProjectRoles = () => createSelector(
  selectOrganization,
  (organizationState: IOrganizationState) => organizationState.projectRoles
)


export {
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
  makeSelectCurrentOrganizationProjectRoles
}
