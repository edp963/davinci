
import OperatorTypes from 'utils/operatorTypes'

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

export const CascadeFilterTypes = [
  FilterTypes.Select
  // FilterTypes.TreeSelect
]

export const defaultFilterControlGridProps = { xxl: 3, xl: 4, lg: 6, md: 12}

export default FilterTypes
