import React from 'react'
import moment from 'moment'
import { uuid } from 'utils/util'
import { FilterTypes, FilterTypesOperatorSetting } from './filterTypes'
import { OperatorTypes } from 'utils/operatorTypes'
import { QueryVariable } from '../../containers/Dashboard/Grid'

import Input from 'antd/lib/input'
// import InputNumber from 'antd/lib/input-number'
import Select from 'antd/lib/select'
const Option = Select.Option
import TreeSelect from 'antd/lib/tree-select'
import DatePicker from 'antd/lib/date-picker'
import NumberRange from '../NumberRange'
import MultiDatePicker from '../MultiDatePicker'
import DatePickerFormats, { DatePickerDefaultValues } from './datePickerFormats'
const { WeekPicker, MonthPicker, RangePicker } = DatePicker
import { SQL_NUMBER_TYPES } from '../../globalConstants'

const styles = require('./filter.less')

export interface IModelItem {
  sqlType: string
  visualType: string
  modelType: 'value' | 'category'
}

export interface IModel {
  [itemName: string]: IModelItem
}

export interface IFilterViewConfig {
  key: number
  name: string
  isVariable: boolean
  sqlType: string
  items: number[]
}

export interface IFilterItem {
  key: string
  name: string
  type: FilterTypes
  fromView?: string
  fromText?: string
  fromModel?: string
  fromSqlType?: string
  fromParent?: string
  // fromChild?: string
  operator: OperatorTypes
  dateFormat?: DatePickerFormats
  multiple?: boolean
  width: number
  dynamicDefaultValue?: any
  defaultValue?: any
  relatedViews: {
    [viewId: string]: IFilterViewConfig
  },
  children?: IFilterItem[]
}

export interface IFilterValue {
  variables: QueryVariable
  filters: string[]
}

export interface IMapItemFilterValue {
  [itemId: number]: IFilterValue
}

export type OnGetFilterControlOptions = (
  controlKey: string,
  viewId: string,
  columns: string[],
  parents: Array<{ column: string, value: string }>
) => void

export type FilterControlOptions = Array<{
  [key: string]: Array<number | string>
}>

export interface IMapFilterControlOptions {
  [controlKey: string]: FilterControlOptions
}

export type OnFilterControlValueChange = (
  filterItem: IFilterItem,
  value: number | string
) => void

export type OnFilterValueChange = (
  mapItemFilterValue: IMapItemFilterValue,
  filterKey: string
) => void

export function getDefaultFilterItem (): IFilterItem {
  const filterItem: IFilterItem = {
    key: uuid(8, 16),
    name: '新建全局筛选',
    type: FilterTypes.InputText,
    operator: FilterTypesOperatorSetting[FilterTypes.InputText][0],
    width: 0,
    relatedViews: {}
  }
  return filterItem
}

export const traverseFilters = (
  filters: IFilterItem[],
  key: string,
  cb: (filter: IFilterItem, idx: number, originFilters: IFilterItem[], parent?: IFilterItem) => void,
  parent?: IFilterItem
) => {
  if (!Array.isArray(filters)) { return }

  filters.forEach((filter, idx, arr) => {
    if (filter.key === key) {
      return cb(filter, idx, arr, parent)
    }
    if (filter.children) {
      return traverseFilters(filter.children, key, cb, filter)
    }
  })
}

export function renderInputText (filter, onChange) {
  return (
    <Input placeholder={filter.name} onChange={onChange} />
  )
}

// export function renderInputNumber (filter, onChange) {
//   return (
//     <InputNumber placeholder={filter.name} onChange={onChange} className={styles.filterControlComponent} />
//   )
// }

export function renderNumberRange (filter, onChange) {
  return (
    <NumberRange placeholder={filter.name} onSearch={onChange} />
  )
}

export function renderSelect (filter, onChange, options) {
  const { fromModel, fromText, multiple } = filter
  return (
    <Select
      allowClear={true}
      placeholder={filter.name}
      onChange={onChange}
      {...multiple && {mode: 'multiple'}}
    >
      {options.map((opt) => (<Option key={opt[fromModel]} value={opt[fromModel]}>{opt[fromText]}</Option>))}
    </Select>
  )
}

export function renderTreeSelect (filter: IFilterItem, onChange, options) {
  const { name, fromModel, fromText, fromParent } = filter
  const treeData = options.map((item) => ({
    id: item[fromModel],
    pId: item[fromParent],
    value: item[fromModel],
    title: item[fromText]
  }))
  return (
    <TreeSelect
      showSearch
      allowClear
      multiple
      treeDataSimpleMode
      placeholder={name}
      treeData={treeData}
      onChange={onChange}
    />
  )
}

export function renderDate (filter: IFilterItem, onChange, extraProps?) {
  const {
    Week,
    Month,
    Year,
    Datetime,
    DatetimeMinute
  } = DatePickerFormats
  switch (filter.dateFormat) {
    case Week:
      return (
        <WeekPicker
          className={styles.filterControlComponent}
          placeholder={filter.name}
          onChange={onChange}
          {...extraProps}
        />
      )
    case Month:
    case Year:
      return (
        <MonthPicker
          className={styles.filterControlComponent}
          placeholder={filter.name}
          format={filter.dateFormat}
          onChange={onChange}
          {...extraProps}
        />
      )
    default:
      const isDatetimePicker = [Datetime, DatetimeMinute].includes(filter.dateFormat)
      return (
        <DatePicker
          className={styles.filterControlComponent}
          placeholder={filter.name}
          showTime={isDatetimePicker}
          format={filter.dateFormat}
          onChange={isDatetimePicker ? datetimePickerChange(onChange) : onChange}
          onOk={onChange}
          {...extraProps}
        />
      )
  }
}

export function renderMultiDate (filter, onChange) {
  return (
    <MultiDatePicker placeholder={filter.name} onChange={onChange} />
  )
}

export function renderDateRange (filter, onChange) {
  const placeholder: [string, string] = [`${filter.name}从`, '到']
  const { Datetime, DatetimeMinute } = DatePickerFormats
  const isDatetimePicker = [Datetime, DatetimeMinute].includes(filter.dateFormat)
  return (
    <RangePicker
      className={styles.filterControlComponent}
      placeholder={placeholder}
      showTime={isDatetimePicker}
      format={filter.dateFormat}
      onChange={isDatetimePicker ? datetimePickerChange(onChange) : onChange}
      onOk={onChange}
    />
  )
}

function datetimePickerChange (onChange) {
  return function (val) {
    if (!val || (Array.isArray(val) && !val.length)) {
      onChange(val)
    }
  }
}

export function getVariableValue (filter: IFilterItem, config: IFilterViewConfig, value) {
  const { type, dateFormat, multiple } = filter
  const { key, sqlType } = config
  let variable = []

  switch (type) {
    case FilterTypes.InputText:
    // case FilterTypes.InputNumber:
    case FilterTypes.Select:
      if (multiple) {
        if (value.length && value.length > 0) {
          variable.push({ name: key, value: value.map((val) => getValidValue(val, sqlType)).join(',') })
        }
      } else {
        if (value !== void 0) {
          variable.push({ name: key, value: getValidValue(value, sqlType) })
        }
      }
      break
    case FilterTypes.NumberRange:
      variable = value.filter((val) => val !== '').map((val) => ({ name: key, value: getValidValue(val, sqlType) }))
      break
    case FilterTypes.TreeSelect:
      if (value.length && value.length > 0) {
        variable.push({ name: key, value: value.map((val) => getValidValue(val, sqlType)).join(',') })
      }
      break
    case FilterTypes.Date:
      if (value) {
        variable.push({ name: key, value: `'${moment(value).format(dateFormat)}'` })
      }
      break
    case FilterTypes.MultiDate:
      if (value) {
        variable.push({ name: key, value: value.split(',').map((v) => `'${v}'`).join(',') })
      }
      break
    case FilterTypes.DateRange:
      if (value.length) {
        variable.push(...value.map((v) => ({ name: key, value: `'${moment(v).format(dateFormat)}'` })))
      }
      break
    default:
      const val = value.target.value.trim()
      if (val) {
        variable.push({ name: key, value: getValidValue(val, sqlType) })
      }
      break
  }
  return variable
}

export function getModelValue (filter: IFilterItem, config: IFilterViewConfig, operator: OperatorTypes, value) {
  const { type, dateFormat, multiple } = filter
  const { key, sqlType } = config
  const filters = []

  switch (type) {
    case FilterTypes.InputText:
    // case FilterTypes.InputNumber:
    case FilterTypes.Select:
      if (multiple) {
        if (value.length && value.length > 0) {
          filters.push(`${key} ${operator} (${value.map((val) => getValidValue(val, sqlType)).join(',')})`)
        }
      } else {
        if (value !== void 0) {
          filters.push(`${key} ${operator} ${getValidValue(value, sqlType)}`)
        }
      }
      break
    case FilterTypes.NumberRange:
      if (value[0] !== '' && !isNaN(value[0])) {
        filters.push(`${key} >= ${getValidValue(value[0], sqlType)}`)
      }
      if (value[1] !== '' && !isNaN(value[1])) {
        filters.push(`${key} <= ${getValidValue(value[1], sqlType)}`)
      }
      break
    case FilterTypes.TreeSelect:
      if (value.length && value.length > 0) {
        filters.push(`${key} ${operator} (${value.map((val) => getValidValue(val, sqlType)).join(',')})`)
      }
      break
    case FilterTypes.Date:
      if (value) {
        filters.push(`${key} ${operator} ${getValidValue(moment(value).format(dateFormat), sqlType)}`)
      }
      break
    case FilterTypes.MultiDate:
      if (value) {
        filters.push(`${key} ${operator} (${value.split(',').map((val) => getValidValue(val, sqlType)).join(',')})`)
      }
      break
    case FilterTypes.DateRange:
      if (value.length) {
        filters.push(`${key} >= ${getValidValue(moment(value[0]).format(dateFormat), sqlType)}`)
        filters.push(`${key} <= ${getValidValue(moment(value[1]).format(dateFormat), sqlType)}`)
      }
      break
    default:
      const inputValue = value.target.value.trim()
      if (inputValue) {
        filters.push(`${key} ${operator} ${getValidValue(inputValue, sqlType)}`)
      }
      break
  }

  return filters
}

export function getValidValue (value, sqlType) {
  if (!value || !sqlType) { return value }
  return SQL_NUMBER_TYPES.indexOf(sqlType) >= 0 ? value : `'${value}'`
}

export function getDefaultValue (filter: IFilterItem) {
  const { type, dynamicDefaultValue, defaultValue } = filter
  switch (type) {
    case FilterTypes.Date:
      if (dynamicDefaultValue) {
        switch (dynamicDefaultValue) {
          case DatePickerDefaultValues.Today:
            return moment()
          case DatePickerDefaultValues.Yesterday:
            return moment().subtract(1, 'days')
          case DatePickerDefaultValues.Week:
            return moment().startOf('week')
          case DatePickerDefaultValues.Day7:
            return moment().subtract(7, 'days')
          case DatePickerDefaultValues.LastWeek:
            return moment().subtract(7, 'days').startOf('week')
          case DatePickerDefaultValues.Month:
            return moment().startOf('month')
          case DatePickerDefaultValues.Day30:
            return moment().subtract(30, 'days')
          case DatePickerDefaultValues.LastMonth:
            return moment().subtract(30, 'days').startOf('month')
          case DatePickerDefaultValues.Quarter:
            return moment().startOf('month')
          case DatePickerDefaultValues.Day90:
            return moment().subtract(90, 'days')
          case DatePickerDefaultValues.LastQuarter:
            return moment().subtract(90, 'days').startOf('quarter')
          case DatePickerDefaultValues.Year:
            return moment().startOf('year')
          case DatePickerDefaultValues.Day365:
            return moment().subtract(365, 'days')
          case DatePickerDefaultValues.LastYear:
            return moment().subtract(90, 'days').startOf('year')
          default:
            return defaultValue && moment(defaultValue)
        }
      } else {
        return null
      }
    default:
      return defaultValue
  }
}
