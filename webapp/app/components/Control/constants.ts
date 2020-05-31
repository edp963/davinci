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

import OperatorTypes from 'utils/operatorTypes'

export enum ControlTypes {
  Select = 'select',
  Date = 'date',
  DateRange = 'dateRange',
  InputText = 'inputText',
  NumberRange = 'numberRange'
  // TreeSelect = 'treeSelect'
}

export const ControlTypeList = [
  ControlTypes.Select,
  ControlTypes.Date,
  ControlTypes.DateRange,
  ControlTypes.InputText,
  ControlTypes.NumberRange
  // ControlTypes.TreeSelect
]

export const ControlTypesLocale = {
  [ControlTypes.Select]: '下拉菜单',
  [ControlTypes.Date]: '日期选择',
  [ControlTypes.DateRange]: '日期范围选择',
  [ControlTypes.InputText]: '文本输入框',
  [ControlTypes.NumberRange]: '数字范围输入框'
  // [ControlTypes.TreeSelect]: '下拉树'
}

export enum DatePickerFormats {
  Date = 'YYYY-MM-DD',
  Datetime = 'YYYY-MM-DD HH:mm:ss',
  DatetimeMinute = 'YYYY-MM-DD HH:mm',
  Month = 'YYYY-MM',
  Week = 'YYYY-ww',
  Year = 'YYYY'
}

export const DatePickerFormatsLocale = {
  [DatePickerFormats.Date]: '日期',
  [DatePickerFormats.Datetime]: '日期时间',
  [DatePickerFormats.DatetimeMinute]: '日期时间分钟',
  [DatePickerFormats.Month]: '月',
  [DatePickerFormats.Week]: '周',
  [DatePickerFormats.Year]: '年'
}

export const DatePickerFormatsSelectSetting = {
  normal: [
    DatePickerFormats.Date,
    DatePickerFormats.Datetime,
    DatePickerFormats.DatetimeMinute,
    DatePickerFormats.Month,
    DatePickerFormats.Week,
    DatePickerFormats.Year
  ],
  multiple: [
    DatePickerFormats.Date,
    DatePickerFormats.Month,
    DatePickerFormats.Year
  ]
}

export enum DatePickerDefaultValues {
  Today = 'today',
  Yesterday = 'yesterday',
  Week = 'week',
  Day7 = 'day7',
  LastWeek = 'lastWeek',
  Month = 'month',
  Day30 = 'day30',
  LastMonth = 'lastMonth',
  Quarter = 'quarter',
  Day90 = 'day90',
  LastQuarter = 'lastQuarter',
  Year = 'year',
  Day365 = 'day365',
  LastYear = 'lastYear',
  Custom = 'custom'
}

export const DatePickerDefaultValuesLocales = {
  [DatePickerDefaultValues.Today]: '今天',
  [DatePickerDefaultValues.Yesterday]: '昨天',
  [DatePickerDefaultValues.Week]: '本周',
  [DatePickerDefaultValues.Day7]: '7天前',
  [DatePickerDefaultValues.LastWeek]: '上周',
  [DatePickerDefaultValues.Month]: '本月',
  [DatePickerDefaultValues.Day30]: '30天前',
  [DatePickerDefaultValues.LastMonth]: '上月',
  [DatePickerDefaultValues.Quarter]: '本季度',
  [DatePickerDefaultValues.Day90]: '90天前',
  [DatePickerDefaultValues.LastQuarter]: '上季度',
  [DatePickerDefaultValues.Year]: '今年',
  [DatePickerDefaultValues.Day365]: '365天前',
  [DatePickerDefaultValues.LastYear]: '去年',
  [DatePickerDefaultValues.Custom]: '自定义'
}

export const SHOULD_LOAD_OPTIONS = {
  [ControlTypes.Select]: true,
  [ControlTypes.Date]: false,
  [ControlTypes.DateRange]: false,
  [ControlTypes.InputText]: false,
  [ControlTypes.NumberRange]: false
  // [ControlTypes.TreeSelect]: true
}

export const IS_RANGE_TYPE = {
  [ControlTypes.Select]: false,
  [ControlTypes.Date]: false,
  [ControlTypes.DateRange]: true,
  [ControlTypes.InputText]: false,
  [ControlTypes.NumberRange]: true
  // [ControlTypes.TreeSelect]: false
}

export const CHANGE_IMMEDIATELY = {
  [ControlTypes.Select]: true,
  [ControlTypes.Date]: true,
  [ControlTypes.DateRange]: true,
  [ControlTypes.InputText]: false,
  [ControlTypes.NumberRange]: false
  // [ControlTypes.TreeSelect]: true
}

export const ControlTypesOperatorSetting = {
  [ControlTypes.Select]: {
    normal: [OperatorTypes.Equal, OperatorTypes.NotEqual],
    multiple: [OperatorTypes.In, OperatorTypes.NotIn]
  },
  [ControlTypes.Date]: {
    normal: [OperatorTypes.Equal, OperatorTypes.LessThan, OperatorTypes.LessThanOrEqual, OperatorTypes.GreaterThan, OperatorTypes.GreaterThanOrEqual],
    multiple: [OperatorTypes.In, OperatorTypes.NotIn]
  },
  [ControlTypes.DateRange]: [],
  [ControlTypes.InputText]: [OperatorTypes.Equal, OperatorTypes.NotEqual],
  [ControlTypes.NumberRange]: []
  // [ControlTypes.TreeSelect]: [OperatorTypes.In, OperatorTypes.NotIn]
}

export const ControlTypesDynamicDefaultValueSetting = {
  [ControlTypes.Date]: {
    normal: [
      DatePickerDefaultValues.Today,
      DatePickerDefaultValues.Yesterday,
      DatePickerDefaultValues.Week,
      DatePickerDefaultValues.Day7,
      DatePickerDefaultValues.LastWeek,
      DatePickerDefaultValues.Month,
      DatePickerDefaultValues.Day30,
      DatePickerDefaultValues.LastMonth,
      DatePickerDefaultValues.Quarter,
      DatePickerDefaultValues.Day90,
      DatePickerDefaultValues.LastQuarter,
      DatePickerDefaultValues.Year,
      DatePickerDefaultValues.Day365,
      DatePickerDefaultValues.LastYear,
      DatePickerDefaultValues.Custom
    ],
    multiple: [DatePickerDefaultValues.Custom]
  }
}

export const CascadeControlTypes = [
  ControlTypes.Select
  // ControlTypes.TreeSelect
]

export enum ControlPanelTypes {
  Global = 'global',
  Local = 'local'
}

export enum ControlPanelLayoutTypes {
  Dashboard = 'dashboard',
  Display = 'display',
  Fullscreen = 'fullscreen',
  DashboardItem = 'dashboardItem'
}

export const DEFAULT_DASHBOARD_CONTROL_GRID_WIDTH = { xxl: 3, xl: 4, lg: 6, md: 12}
export const DEFAULT_DASHBOARD_ITEM_CONTROL_GRID_WIDTH = { xxl: 8, xl: 12, lg: 12, md: 12}
