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

import { IMembers, IOrganizationRole, IOrganization } from 'app/containers/Organizations/types'
import { IProject } from 'app/containers/Projects/types'
import { ProjectDemo } from '../Projects/fixtures'

const memberDemo: IMembers = {
  id: 811,
  user: {
    avatar: '',
    email: '',
    id: 1,
    role: 0,
    username: 'shan'
  }
}

const orgDemo: IOrganization = {
  id: 1,
  name: 'string',
  avatar: '',
  description: ''
}

const roleDemo: IOrganizationRole = {
  id: 1,
  name: 'roleName',
  description: 'desc'
}

interface ImockStore {
  orgId: number
  memberId: number
  project: IProject
  projects: IProject[]
  orgProjects: {
    list: IProject[]
  }
  member: IMembers
  members: IMembers[]
  role: IOrganizationRole
  roles: IOrganizationRole[]
  organization: IOrganization
  organizations: IOrganization[]
  resolve: () => void

}

export const mockStore: ImockStore = {
  orgId: 1,
  memberId: 1,
  project: ProjectDemo,
  projects: [ProjectDemo],
  member: memberDemo,
  members: [memberDemo],
  role: roleDemo,
  roles: [roleDemo],
  organization: orgDemo,
  organizations: [orgDemo],
  orgProjects: {
    list: [ProjectDemo]
  },
  resolve: () => void 0
}
