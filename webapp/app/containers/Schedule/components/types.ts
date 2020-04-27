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

import { IScheduleVizConfigItem } from './ScheduleVizConfig/types'
import { RichTextNode } from 'components/RichText'

export * from './ScheduleVizConfig/types'
export type JobStatus = 'new' | 'failed' | 'started' | 'stopped'
export type JobType = 'email'
export type ScheduleType = 'image' | 'excel' | 'imageAndExcel'
export type SchedulePeriodUnit =
  | 'Minute'
  | 'Hour'
  | 'Day'
  | 'Week'
  | 'Month'
  | 'Year'

export interface IScheduleBase {
  id: number
  name: string
  description: string
  projectId: number
  startDate: string
  endDate: string
  cronExpression: string
  jobStatus: JobStatus
  jobType: JobType
  execLog: string
}

export interface IScheduleRaw extends IScheduleBase {
  config: string
}

export interface IScheduleMailConfig {
  subject: string
  content: string | RichTextNode[]
  to: string
  cc: string
  bcc: string
  type: ScheduleType
  imageWidth: number
  contentList: IScheduleVizConfigItem[]
}

export interface ISchedule extends IScheduleBase {
  config: IScheduleMailConfig
}

export interface IUserInfo {
  id: number
  username: string
  email: string
  avatar: string
}

export interface ICronExpressionPartition {
  periodUnit: SchedulePeriodUnit
  minute: number
  hour: number
  day: number
  month: number
  weekDay: number
}
