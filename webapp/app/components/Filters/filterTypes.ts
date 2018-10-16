
import OperatorTypes from './operatorTypes'

export enum FilterTypes {
  InputText = 'inputText',
  InputNumber = 'inputNumber',
  NumberRange = 'NumberRange',
  Select = 'select',
  MultiSelect = 'multiSelect',
  CascadeSelect = 'cascadeSelect',
  InputDate = 'inputDate',
  MultiDate = 'multiDate',
  DateRange = 'dateRange',
  Datetime = 'datetime',
  DatetimeRange = 'datetimeRange'
}

export const FilterTypeList = [
  FilterTypes.InputText,
  FilterTypes.InputNumber,
  FilterTypes.NumberRange,
  FilterTypes.Select,
  FilterTypes.MultiSelect,
  // FilterTypes.CascadeSelect,
  FilterTypes.InputDate,
  FilterTypes.MultiDate,
  FilterTypes.DateRange,
  FilterTypes.Datetime,
  FilterTypes.DatetimeRange
]

export const FilterTypesLocale = {
  [FilterTypes.InputText]: '文本输入框',
  [FilterTypes.InputNumber]: '数字输入框',
  [FilterTypes.NumberRange]: '数字范围输入框',
  [FilterTypes.Select]: '单选下拉菜单',
  [FilterTypes.MultiSelect]: '多选下拉菜单',
  [FilterTypes.CascadeSelect]: '级联下拉菜单',
  [FilterTypes.InputDate]: '日期选择',
  [FilterTypes.MultiDate]: '日期多选',
  [FilterTypes.DateRange]: '日期范围选择',
  [FilterTypes.Datetime]: '日期时间选择',
  [FilterTypes.DatetimeRange]: '日期时间范围选择'
}

export const FilterTypesViewSetting = {
  [FilterTypes.InputText]: false,
  [FilterTypes.InputNumber]: false,
  [FilterTypes.NumberRange]: false,
  [FilterTypes.Select]: true,
  [FilterTypes.MultiSelect]: true,
  [FilterTypes.CascadeSelect]: true,
  [FilterTypes.InputDate]: false,
  [FilterTypes.MultiDate]: false,
  [FilterTypes.DateRange]: false,
  [FilterTypes.Datetime]: false,
  [FilterTypes.DatetimeRange]: false
}

export const FilterTypesOperatorSetting = {
  [FilterTypes.InputText]: [OperatorTypes.Equal, OperatorTypes.NotEqual],
  [FilterTypes.InputNumber]: [OperatorTypes.LessThan, OperatorTypes.LessThanOrEqual, OperatorTypes.GreaterThan, OperatorTypes.GreaterThanOrEqual],
  [FilterTypes.NumberRange]: [],
  [FilterTypes.Select]: [OperatorTypes.Equal, OperatorTypes.NotEqual],
  [FilterTypes.MultiSelect]: [OperatorTypes.In, OperatorTypes.NotIn],
  [FilterTypes.InputDate]: [OperatorTypes.LessThan, OperatorTypes.LessThanOrEqual, OperatorTypes.GreaterThan, OperatorTypes.GreaterThanOrEqual],
  [FilterTypes.MultiDate]: [OperatorTypes.In, OperatorTypes.NotIn],
  [FilterTypes.DateRange]: [],
  [FilterTypes.Datetime]: [OperatorTypes.LessThan, OperatorTypes.LessThanOrEqual, OperatorTypes.GreaterThan, OperatorTypes.GreaterThanOrEqual],
  [FilterTypes.DatetimeRange]: []
}

export default FilterTypes
