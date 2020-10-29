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
import { IOrganization } from '../Organizations/types'

export interface IProjectPermission {
  downloadPermission: boolean
  schedulePermission: number
  sharePermission: boolean
  sourcePermission: number
  viewPermission: number
  vizPermission: number
  widgetPermission: number
}

export interface IProject {
  createBy?: { avatar?: string; id?: number; username?: string; email: string }
  permission?: IProjectPermission
  initialOrgId?: number
  userId: number
  isStar?: boolean
  isTransfer?: boolean
  isFavorites?: boolean
  type?: string
  name?: string
  id?: number
  description?: string
  pic?: string
  orgId?: number
  visibility?: boolean
  starNum?: number
}

export interface IStarUser {
  avatar: string
  id: number
  email?: string
  starTime: string
  username: string
}

export interface IProjectRole {
  id: number
  name: string
  description: string
}

interface IProjectRolePermission extends IProjectRole {
  permission: IProjectPermission
}

export interface IProjectState {
  projects: IProject[]
  currentProject: IProject
  currentProjectLoading: boolean
  searchProject: boolean
  starUserList: IStarUser[]
  collectProjects: IProject[]
  currentProjectRole: IProjectRolePermission
  projectRoles: IProjectRole[]
}

export interface IProjectFormFieldProps {
  id?: number
  orgId_hc?: string
  orgId?: number
  name?: string
  description?: string
  visibility?: string
  pic?: string
}

export interface IProjectsFormProps {
  type?: string
  organizations?: any
  onTransfer?: () => any
  onModalOk?: () => any
  modalLoading: boolean
  currentPro: Partial<IProject>
  onCheckUniqueName?: (
    pathname: any,
    data: any,
    resolve: () => any,
    reject: (error: string) => any
  ) => any
}

export interface IEnhanceButtonProps {
  type?: string
}

export interface IProjectsProps {
  projects: IProject[]
  collectProjects: IProject[]
  loginUser: any
  searchProject?: {
    list: any[]
    total: number
    pageNum: number
    pageSize: number
  }
  organizations: IOrganization[]
  starUserList: IStarUser[]
  onTransferProject: (id: number, orgId: number) => any
  onEditProject: (project: any, resolve: () => any) => any
  onLoadProjects: () => any
  onAddProject: (project: any, resolve: () => any) => any
  onLoadOrganizations: () => any
  onLoadCollectProjects: () => any
  onClickCollectProjects: (
    isFavorite: boolean,
    proId: number,
    resolve: (id: number) => any
  ) => any
  onDeleteProject: (id: number, resolve?: any) => any
  onLoadProjectDetail: (id: number) => any
  onStarProject: (id: number, resolve: () => any) => any
  onGetProjectStarUser: (id: number) => any
  onSearchProject: (param: {
    keywords: string
    pageNum: number
    pageSize: number
  }) => any
  onCheckUniqueName: (
    pathname: any,
    data: any,
    resolve: () => any,
    reject: (error: string) => any
  ) => any
}

export enum projectType {
  all = '全部',
  join = '我参与的',
  create = '我创建的',
  favorite = '我收藏的',
  history = '最近浏览的'
}

export enum projectTypeSmall {
  all = '全部',
  join = '参与',
  create = '创建',
  favorite = '收藏',
  history = '历史'
}

export type IProjectType = 'all' | 'join' | 'create' | 'favorite' | 'history'

export type IDOMEventHandler = (event: React.MouseEvent<HTMLElement>) => any
export interface IToolbarProps {
  pType?: string
  setKeywords: (keywords: string) => any
  searchKeywords?: string
  setPType: (type: IProjectType) => any
  setFormVisible: IDOMEventHandler
  showProForm: IShowProForm
}

export interface ItemToolbarProps {
  isStar: boolean
  isFavorite: boolean
  onStar: IDOMEventHandler
  onTransfer: IDOMEventHandler
  onEdit: IDOMEventHandler
  onDelete: IDOMEventHandler
  onFavorite: IDOMEventHandler
  organization: IOrganization
  isMimePro: boolean
  pType: string
  StarCom?: any
}

export interface ITagProps {
  type: Array<'create' | 'favorite' | 'join'>
}

export enum eTag {
  create = '创建',
  favorite = '收藏',
  join = '参与'
}

export interface ItemProps {
  key: string
  pro: IProject
  userId: number
  pType?: string
  history: History
  organizations: IOrganization[]
  showProForm?: IShowProForm
  deletePro?: IDeletePro
  favoritePro?: IFavoritePro
}

export type IShowProForm = (
  formType: string,
  project: Partial<IProject>,
  e: React.MouseEvent<HTMLElement>
) => void
export interface IContentProps {
  userId: number
  pType: string
  deletePro: IDeletePro
  favoritePro: IFavoritePro
  searchKeywords: string
  projects: IProject[]
  history: History
  organizations: IOrganization[]
  collectProjects: IProject[]
  showProForm: IShowProForm
}

export enum FormType {
  'transfer' = '移交',
  'add' = '创建',
  'edit' = '修改'
}

export type IDeletePro = (proId: number, isFavorite: boolean) => void

export type IFavoritePro = (proId: number, isFavorite: boolean) => void
