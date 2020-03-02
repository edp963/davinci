import { IProject } from 'containers/Projects/types'

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
  user: {
    id: number
    username: string
    email: string
    role: number
    avatar: string
  }
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
