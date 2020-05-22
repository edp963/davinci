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

export enum RelativeDateType {
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Quarter = 'quarter',
  Year = 'year'
}

export enum RelativeDateValueType {
  Prev = 'prev',
  Current = 'current',
  Next = 'next'
}

export const RelativeDateTypeLabels = {
  [RelativeDateType.Day]: '天',
  [RelativeDateType.Week]: '周',
  [RelativeDateType.Month]: '月',
  [RelativeDateType.Quarter]: '季度',
  [RelativeDateType.Year]: '年'
}

export const RelativeDateValueTypeLables = {
  [RelativeDateValueType.Current]: {
    [RelativeDateType.Day]: '今',
    [RelativeDateType.Week]: '本',
    [RelativeDateType.Month]: '本',
    [RelativeDateType.Quarter]: '本',
    [RelativeDateType.Year]: '今'
  },
  [RelativeDateValueType.Prev]: '前',
  [RelativeDateValueType.Next]: '后'
}
