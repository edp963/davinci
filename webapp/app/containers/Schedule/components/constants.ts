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

import { FormItemProps } from 'antd/lib/form'
import { SchedulePeriodUnit } from './types'
import { getDefaultContent } from 'app/components/RichText'

export const DefaultSchedulePeriodExpression: {
  [key in SchedulePeriodUnit]: string
} = {
  // Every 10 minutes
  Minute: '0 */10 * * * ?',

  // At second :00 of minute :00 of every hour
  Hour: '0 0 * * * ?',

  // At 00:00:00am every day
  Day: '0 0 0 * * ?',

  // At 00:00:00am, on every Monday, every month
  Week: '0 0 0 ? * 1',

  // At 00:00:00am, on the 1st day, every month
  Month: '0 0 0 1 * ?',

  // At 00:00:00am, on the 1st day, in January
  Year: '0 0 0 1 1 ?'
}

export const DefaultMailImageWidth = 1920

export const DefaultEmailContent = getDefaultContent(
  'This email comes from cron job on the Davinci.'
)

export const FormItemStyle: Partial<FormItemProps> = {
  labelCol: { xl: 8, lg: 10, md: 14, sm: 8 },
  wrapperCol: { xl: 14, lg: 12, md: 10, sm: 14 }
}

export const LongFormItemStyle: Partial<FormItemProps> = {
  labelCol: { xl: 4, lg: 5, md: 7, sm: 4 },
  wrapperCol: { xl: 19, lg: 18, md: 17, sm: 19 }
}
