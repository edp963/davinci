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
  createBy?: { avatar?: string, id?: number, username?: string}
  permission?: IProjectPermission
  inTeam?: boolean
  isStar?: boolean
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
  starTime: string
  username: string
}

interface IProjectRole {
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
