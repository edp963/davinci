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
  JobType,
  IUserInfo,
  ISchedule,
  JobStatus
} from 'app/containers/Schedule/components/types'
import { IDashboard } from 'app/containers/Dashboard/types'

interface ImockStore {
  schedule: ISchedule
  projectId: number
  schedules: ISchedule[]
  scheduleId: number
  resolve: () => void
  jobType: JobType
  mails: IUserInfo[]
  keywords: string
  jobStatus: JobStatus
  dashboard: IDashboard
  api: string
}

const scheduleDemo: ISchedule = {
  id: 1,
  name: 'scheduleName',
  description: 'desc',
  projectId: 2,
  startDate: '',
  endDate: '',
  cronExpression: '',
  jobStatus: 'new',
  jobType: 'email',
  execLog: '',
  config: {
    webHookUrl: 'string',
    type: 'string',
    imageWidth: 1,
    contentList: [],
    setCronExpressionManually: false
  }
}

export const mockStore: ImockStore = {
  schedule: scheduleDemo,
  projectId: 1,
  schedules: [scheduleDemo],
  jobStatus: scheduleDemo.jobStatus,
  scheduleId: 2,
  keywords: 'keywords',
  resolve: () => void 0,
  jobType: 'email',
  mails: [
    {
      id: 1,
      username: '',
      email: '',
      avatar: ''
    }
  ],
  dashboard: {
    id: 1,
    name: 'string',
    parentId: 1,
    index: 1,
    dashboardPortalId: 1,
    type: 0,
    config: {
      filters: [],
      linkages: [],
      queryMode: 0
    }
  },
  api: '/api/v3/protal/projectId'
}
