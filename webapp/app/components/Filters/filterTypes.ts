
import OperatorTypes from 'utils/operatorTypes'

export enum FilterTypes {
  InputText = 'inputText',
  // InputNumber = 'inputNumber',
  NumberRange = 'numberRange',
  Select = 'select',
  TreeSelect = 'treeSelect',
  Date = 'date',
  DateRange = 'dateRange',
  MultiDate = 'multiDate'
}

export const FilterTypeList = [
  FilterTypes.InputText,
  // FilterTypes.InputNumber,
  FilterTypes.NumberRange,
  FilterTypes.Select,
  FilterTypes.TreeSelect,
  FilterTypes.Date,
  FilterTypes.DateRange,
  FilterTypes.MultiDate
]

export const FilterTypesLocale = {
  [FilterTypes.InputText]: '文本输入框',
  // [FilterTypes.InputNumber]: '数字输入框',
  [FilterTypes.NumberRange]: '数字范围输入框',
  [FilterTypes.Select]: '下拉菜单',
  [FilterTypes.TreeSelect]: '下拉树',
  [FilterTypes.Date]: '日期选择',
  [FilterTypes.DateRange]: '日期范围选择',
  [FilterTypes.MultiDate]: '日期多选'
}

export const FilterTypesViewSetting = {
  [FilterTypes.InputText]: false,
  // [FilterTypes.InputNumber]: false,
  [FilterTypes.NumberRange]: false,
  [FilterTypes.Select]: true,
  [FilterTypes.TreeSelect]: true,
  [FilterTypes.Date]: false,
  [FilterTypes.DateRange]: false,
  [FilterTypes.MultiDate]: false
}

export const FilterTypesOperatorSetting = {
  [FilterTypes.InputText]: [OperatorTypes.Equal, OperatorTypes.NotEqual],
  // [FilterTypes.InputNumber]: [OperatorTypes.Equal, OperatorTypes.LessThan, OperatorTypes.LessThanOrEqual, OperatorTypes.GreaterThan, OperatorTypes.GreaterThanOrEqual],
  [FilterTypes.NumberRange]: [],
  [FilterTypes.Select]: {
    normal: [OperatorTypes.Equal, OperatorTypes.NotEqual],
    multiple: [OperatorTypes.In, OperatorTypes.NotIn]
  },
  [FilterTypes.TreeSelect]: [OperatorTypes.In, OperatorTypes.NotIn],
  [FilterTypes.Date]: [OperatorTypes.Equal, OperatorTypes.LessThan, OperatorTypes.LessThanOrEqual, OperatorTypes.GreaterThan, OperatorTypes.GreaterThanOrEqual],
  [FilterTypes.DateRange]: [],
  [FilterTypes.MultiDate]: [OperatorTypes.Equal, OperatorTypes.In, OperatorTypes.NotIn]
}

export const CascadeFilterTypes = [
  FilterTypes.Select,
  FilterTypes.TreeSelect
]

export const defaultFilterControlGridProps = { xxl: 3, xl: 4, lg: 6, md: 12}

export default FilterTypes
