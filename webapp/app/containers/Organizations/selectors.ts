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

const selectOrganization = (state) => state.get('organization')

const makeSelectOrganizations = () => createSelector(
  selectOrganization,
  (organizationState) => organizationState.get('organizations')
)

const makeSelectInviteMemberList = () => createSelector(
  selectOrganization,
  (organizationState) => organizationState.get('inviteMemberLists')
)

const makeSelectCurrentOrganizations = () => createSelector(
  selectOrganization,
  (organizationState) => organizationState.get('currentOrganization')
)

const makeSelectCurrentOrganizationProjects = () => createSelector(
  selectOrganization,
  (organizationState) => organizationState.get('currentOrganizationProjects')
)

const makeSelectCurrentOrganizationProjectsDetail = () => createSelector(
  selectOrganization,
  (organizationState) => organizationState.get('currentOrganizationProjectsDetail')
)

const makeSelectCurrentOrganizationRole = () => createSelector(
  selectOrganization,
  (organizationState) => organizationState.get('currentOrganizationRole')
)

const makeSelectCurrentOrganizationMembers = () => createSelector(
  selectOrganization,
  (organizationState) => organizationState.get('currentOrganizationMembers')
)

const makeSelectRoleModalLoading = () => createSelector(
  selectOrganization,
  (organizationState) => organizationState.get('roleModalLoading')
)

const makeSelectCurrentOrganizationProject = () => createSelector(
  selectOrganization,
  (organizationState) => organizationState.get('projectDetail')
)

const makeSelectCurrentOrganizationProjectAdmins = () => createSelector(
  selectOrganization,
  (organizationState) => organizationState.get('projectAdmins')
)

const makeSelectCurrentOrganizationProjectRoles = () => createSelector(
  selectOrganization,
  (organizationState) => organizationState.get('projectRoles')
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
