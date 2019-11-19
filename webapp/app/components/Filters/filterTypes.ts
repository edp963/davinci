
import OperatorTypes from 'utils/operatorTypes'
import { DatePickerDefaultValues } from './datePickerFormats'

export enum FilterTypes {
  Select = 'select',
  Date = 'date',
  DateRange = 'dateRange',
  InputText = 'inputText',
  NumberRange = 'numberRange'
  // TreeSelect = 'treeSelect'
}

export const FilterTypeList = [
  FilterTypes.Select,
  FilterTypes.Date,
  FilterTypes.DateRange,
  FilterTypes.InputText,
  FilterTypes.NumberRange
  // FilterTypes.TreeSelect
]

export const FilterTypesLocale = {
  [FilterTypes.Select]: '下拉菜单',
  [FilterTypes.Date]: '日期选择',
  [FilterTypes.DateRange]: '日期范围选择',
  [FilterTypes.InputText]: '文本输入框',
  [FilterTypes.NumberRange]: '数字范围输入框'
  // [FilterTypes.TreeSelect]: '下拉树'
}

export const SHOULD_LOAD_OPTIONS = {
  [FilterTypes.Select]: true,
  [FilterTypes.Date]: false,
  [FilterTypes.DateRange]: false,
  [FilterTypes.InputText]: false,
  [FilterTypes.NumberRange]: false
  // [FilterTypes.TreeSelect]: true
}

export const IS_RANGE_TYPE = {
  [FilterTypes.Select]: false,
  [FilterTypes.Date]: false,
  [FilterTypes.DateRange]: true,
  [FilterTypes.InputText]: false,
  [FilterTypes.NumberRange]: true
  // [FilterTypes.TreeSelect]: false
}

export const FilterTypesOperatorSetting = {
  [FilterTypes.Select]: {
    normal: [OperatorTypes.Equal, OperatorTypes.NotEqual],
    multiple: [OperatorTypes.In, OperatorTypes.NotIn]
  },
  [FilterTypes.Date]: {
    normal: [OperatorTypes.Equal, OperatorTypes.LessThan, OperatorTypes.LessThanOrEqual, OperatorTypes.GreaterThan, OperatorTypes.GreaterThanOrEqual],
    multiple: [OperatorTypes.In, OperatorTypes.NotIn]
  },
  [FilterTypes.DateRange]: [],
  [FilterTypes.InputText]: [OperatorTypes.Equal, OperatorTypes.NotEqual],
  [FilterTypes.NumberRange]: []
  // [FilterTypes.TreeSelect]: [OperatorTypes.In, OperatorTypes.NotIn]
}

export const FilterTypesDynamicDefaultValueSetting = {
  [FilterTypes.Date]: {
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

export const CascadeFilterTypes = [
  FilterTypes.Select
  // FilterTypes.TreeSelect
]

export const defaultFilterControlGridProps = { xxl: 3, xl: 4, lg: 6, md: 12}

export const fullScreenFilterControlGridProps = {xxl: 12, xl: 12, lg: 12, md: 12}

export const fullScreenGlobalControlGridProps = {xxl: 12, xl: 12, lg: 12, md: 12}


export default FilterTypes
