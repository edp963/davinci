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
import { IProject, IStarUser } from 'containers/Projects/types'
export interface IDavinciUser {
  id: number
  username: string
  email: string
  role: number
  avatar: string
}
export interface IOrganization {
  id: number
  name: string
  description: string
  avatar: string
  allowCreateProject?: number
  allowDeleteOrTransferProject?: number
  allowChangeVisibility?: number
  memberPermission?: number
  projectNum?: number
  memberNum?: number
  roleNum?: number
  role?: number
}

export interface IOrganizationMember {
  id: number
  user: IDavinciUser
}

export interface IOrganizationRole {
  id: number
  name: string
  description: string
}

export interface IOrganizationState {
  organizations: IOrganization[],
  currentOrganization: IOrganization,
  currentOrganizationLoading: boolean,
  currentOrganizationProjects: IProject[],
  currentOrganizationProjectsDetail: { total: number, list: IProject[] },
  currentOrganizationMembers: IOrganizationMember[],
  currentOrganizationRole: IOrganizationRole[],
  inviteMemberLists: null, // @FIXME need change to remote org users search
  roleModalLoading: boolean,
  projectDetail: IProject,
  projectAdmins: IOrganizationMember[],
  projectRoles: IOrganizationRole[]
}

export interface IMembers {
  id: number
  user: IDavinciUser
}


export interface IMembersState {
  category?: string
  formKey?: number
  formVisible: boolean
  modalLoading: boolean
  currentMember: IOrganizationMember
  changeRoleFormCategory: string
  changeRoleFormVisible: boolean
  changeRoleModalLoading: boolean
  organizationMembers: IMembers[]
  cacheOrganizationMembers: IMembers[]
}

export interface IMembersProps {
  loginUser: any
  organizationId: number
  loadOrganizationsMembers: (id: number) => any
  deleteOrganizationMember: (id: number, resolve: () => any) => any
  organizationMembers: IMembers[]
  changeOrganizationMemberRole: (
    id: number,
    role: number,
    resolve: () => any
  ) => any
  currentOrganization: IOrganization
  inviteMemberList: any
  onInviteMember: (ordId: number, memId: number) => any
  handleSearchMember: (keywords: string) => any
  toThatUserProfile: (url: string) => any
  onGetRoleListByMemberId: (
    orgId: number,
    memberId: number,
    resolve: (res: any) => void
  ) => void
}


export interface IProjectsStates {
  formType?: string
  formVisible: boolean
  modalLoading: boolean
  editFormVisible: boolean
  adminFormVisible: boolean
  pageNum: number
  pageSize: number
  currentProject: any
  organizationProjects: IProject[]
}

export interface IProjectsProps {
  loginUser: any
  organizationId: number
  organizations: any
  projectDetail: any
  currentOrganization: IOrganization
  toProject: (id: number) => any
  deleteProject: (id: number) => any
  starUser: IStarUser[]
  collectProjects: IProject[]
  onAddProject: (project: any, resolve: () => any) => any
  onEditProject: (project: any, resolve: () => any) => any
  organizationProjects: IProject[]
  organizationProjectsDetail: { total?: number; list: IProject[] }
  unStar?: (id: number) => any
  userList?: (id: number) => any
  onCheckUniqueName: (
    pathname: any,
    data: any,
    resolve: () => any,
    reject: (error: string) => any
  ) => any
  getOrganizationProjectsByPagination: (obj: {
    keyword?: string
    pageNum: number
    pageSize: number
  }) => any
  onLoadOrganizationProjects: (param: {
    id: number
    pageNum?: number
    pageSize?: number
  }) => any
  onClickCollectProjects: (
    formType,
    project: object,
    resolve: (id: number) => any
  ) => any
  onLoadCollectProjects: () => any
  onTransferProject: (id: number, orgId: number, resolve: () => any) => any
  onSetCurrentProject: (option: any) => any
  starUserList: IStarUser[]
  onStarProject: (id: number, resolve: () => any) => any
  onDeleteProject: (id: number, resolve?: any) => any
  onGetProjectStarUser: (id: number) => any
  currentOrganizationProjects: IProject[]
  organizationMembers: any[]
  onLoadVizs: (projectId: number) => any
  onLoadOrganizations: () => any
  vizs: any
}
