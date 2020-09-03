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
  Radio = 'radio',
  Date = 'date',
  DateRange = 'dateRange',
  InputText = 'inputText',
  NumberRange = 'numberRange',
  Slider = 'slider',
  TreeSelect = 'treeSelect'
}

export const ControlTypesLocale = {
  [ControlTypes.Select]: '下拉菜单',
  [ControlTypes.Radio]: '单选按钮',
  [ControlTypes.Date]: '日期选择',
  [ControlTypes.DateRange]: '日期范围选择',
  [ControlTypes.InputText]: '文本输入框',
  [ControlTypes.NumberRange]: '数字范围输入框',
  [ControlTypes.Slider]: '数字滑块',
  [ControlTypes.TreeSelect]: '下拉树'
}

export enum ControlFieldTypes {
  Column = 'column',
  Variable = 'variable'
}

export enum ControlOptionTypes {
  Auto = 'auto',
  Manual = 'manual',
  Custom = 'custom'
}

export enum ControlDefaultValueTypes {
  Dynamic = 'dynamic',
  Fixed = 'fixed'
}

export enum ControlVisibilityTypes {
  Visible = 'visible',
  Hidden = 'hidden',
  Conditional = 'conditional'
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

export const SHOULD_LOAD_OPTIONS = {
  [ControlTypes.Select]: true,
  [ControlTypes.Radio]: true,
  [ControlTypes.Date]: false,
  [ControlTypes.DateRange]: false,
  [ControlTypes.InputText]: false,
  [ControlTypes.NumberRange]: false,
  [ControlTypes.Slider]: false,
  [ControlTypes.TreeSelect]: true
}

export const IS_RANGE_TYPE = {
  [ControlTypes.Select]: false,
  [ControlTypes.Radio]: false,
  [ControlTypes.Date]: false,
  [ControlTypes.DateRange]: true,
  [ControlTypes.InputText]: false,
  [ControlTypes.NumberRange]: true,
  [ControlTypes.Slider]: true,
  [ControlTypes.TreeSelect]: false
}

export const IS_DATE_TYPE = {
  [ControlTypes.Select]: false,
  [ControlTypes.Radio]: false,
  [ControlTypes.Date]: true,
  [ControlTypes.DateRange]: true,
  [ControlTypes.InputText]: false,
  [ControlTypes.NumberRange]: false,
  [ControlTypes.Slider]: false,
  [ControlTypes.TreeSelect]: false
}

export const IS_NUMBER_TYPE = {
  [ControlTypes.Select]: false,
  [ControlTypes.Radio]: false,
  [ControlTypes.Date]: false,
  [ControlTypes.DateRange]: false,
  [ControlTypes.InputText]: false,
  [ControlTypes.NumberRange]: true,
  [ControlTypes.Slider]: true,
  [ControlTypes.TreeSelect]: false
}

export const CHANGE_IMMEDIATELY = {
  [ControlTypes.Select]: true,
  [ControlTypes.Radio]: true,
  [ControlTypes.Date]: true,
  [ControlTypes.DateRange]: true,
  [ControlTypes.InputText]: false,
  [ControlTypes.NumberRange]: false,
  [ControlTypes.Slider]: true,
  [ControlTypes.TreeSelect]: true
}

export const ControlTypesOperatorSetting = {
  [ControlTypes.Select]: {
    normal: [OperatorTypes.Equal, OperatorTypes.NotEqual],
    multiple: [OperatorTypes.In, OperatorTypes.NotIn]
  },
  [ControlTypes.Radio]: [OperatorTypes.Equal, OperatorTypes.NotEqual],
  [ControlTypes.Date]: {
    normal: [
      OperatorTypes.Equal,
      OperatorTypes.LessThan,
      OperatorTypes.LessThanOrEqual,
      OperatorTypes.GreaterThan,
      OperatorTypes.GreaterThanOrEqual
    ],
    multiple: [OperatorTypes.In, OperatorTypes.NotIn]
  },
  [ControlTypes.DateRange]: [],
  [ControlTypes.InputText]: [
    OperatorTypes.Equal,
    OperatorTypes.NotEqual,
    OperatorTypes.Contain,
    OperatorTypes.NotContain
  ],
  [ControlTypes.NumberRange]: [],
  [ControlTypes.Slider]: [],
  [ControlTypes.TreeSelect]: {
    normal: [OperatorTypes.Equal, OperatorTypes.NotEqual],
    multiple: [OperatorTypes.In, OperatorTypes.NotIn]
  }
}

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

export const DEFAULT_DASHBOARD_CONTROL_GRID_WIDTH = {
  xxl: 3,
  xl: 4,
  lg: 6,
  md: 12
}
export const DEFAULT_DASHBOARD_ITEM_CONTROL_GRID_WIDTH = {
  xxl: 8,
  xl: 12,
  lg: 12,
  md: 12
}

export enum ControlQueryMode {
  Immediately,
  Manually
}

export const CONTROL_MAX_TAG_COUNT = 10
export const CONTROL_MAX_TAG_TEXT_LENGTH = 10
