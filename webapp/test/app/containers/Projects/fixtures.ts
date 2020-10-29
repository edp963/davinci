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
  IProject,
  IStarUser,
  IProjectRole
} from 'app/containers/Projects/types'

interface ImockStore {
  projectId: number
  project: IProject
  projects: IProject[]
  resolve: () => void
  orgId: number
  isFavorite: boolean
  adminIds: number[]
  relationId: number
  user: IStarUser
  role: IProjectRole
}

export const ProjectDemo: IProject = {
  createBy: {
    avatar: '',
    email: '',
    id: 4,
    username: ''
  },
  description: '',
  id: 4,
  initialOrgId: 4,
  isStar: true,
  isTransfer: false,
  name: 'test',
  orgId: 4,
  permission: {
    downloadPermission: false,
    schedulePermission: 0,
    sharePermission: false,
    sourcePermission: 0,
    viewPermission: 0,
    vizPermission: 1,
    widgetPermission: 0
  },
  pic: '15',
  starNum: 1,
  userId: 4,
  visibility: true
}

export const mockStore: ImockStore = {
  orgId: 1,
  projectId: 1000,
  projects: [ProjectDemo],
  project: ProjectDemo,
  resolve: () => void 0,
  isFavorite: false,
  adminIds: [1, 3],
  relationId: 33,
  user: {
    avatar: '3c-f759-45c6-a3cb-a9b5ed88acfd.png',
    email: 'xxxx@xxx.cn',
    id: 5,
    starTime: '2020-06-04 10:53:39',
    username: 'xxxx'
  },
  role: {
    description: 'deving',
    id: 7,
    name: 'tank'
  }
}
