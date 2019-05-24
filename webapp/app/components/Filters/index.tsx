import React from 'react'
import moment from 'moment'
import { uuid } from 'utils/util'
import { FilterTypes, FilterTypesOperatorSetting, IS_RANGE_TYPE } from './filterTypes'
import { OperatorTypes } from 'utils/operatorTypes'
import { QueryVariable } from '../../containers/Dashboard/Grid'

import { Input, Select, TreeSelect, DatePicker } from 'antd'
const Option = Select.Option
import NumberRange from '../NumberRange'
const MultiDatePicker = React.lazy(() => import('../MultiDatePicker'))
import DatePickerFormats, { DatePickerDefaultValues, DatePickerFormatsSelectSetting } from './datePickerFormats'
const { WeekPicker, MonthPicker, RangePicker } = DatePicker
import { SQL_NUMBER_TYPES, SqlTypes } from '../../globalConstants'
import { ViewVariableValueTypes, ViewVariableTypes } from 'app/containers/View/constants'
import { IFormedView, IViewModelProps, IViewVariable } from 'app/containers/View/types'

const styles = require('./filter.less')

export type InteractionType = 'column' | 'variable'

export interface IGlobalControlRelatedItem {
  viewId: number
  checked: boolean
}

export interface IControlRelatedField {
  name: string
  type: SqlTypes | ViewVariableValueTypes
  optionsFromColumn?: boolean
  column?: string
}

export interface IControlSelectOption {
  text: string
  value: string
  variable?: string
}

export interface IControlBase {
  key: string
  name: string
  type: FilterTypes
  interactionType: InteractionType
  operator: OperatorTypes
  dateFormat?: DatePickerFormats
  multiple?: boolean
  customOptions?: boolean
  options?: IControlSelectOption[]
  width: number
  dynamicDefaultValue?: any
  defaultValue?: any
  parent?: string
}

export interface IGlobalControl extends IControlBase {
  relatedItems: {
    [itemId: string]: IGlobalControlRelatedItem
  }
  relatedViews: {
    [viewId: string]: IControlRelatedField | IControlRelatedField[]
  }
}

export interface ILocalControl extends IControlBase {
  fields: IControlRelatedField | IControlRelatedField[]
}

export interface IRenderTreeItem extends IControlBase {
  children?: IRenderTreeItem[]
}

export interface IGlobalRenderTreeItem extends IRenderTreeItem {
  relatedItems: {
    [itemId: string]: IGlobalControlRelatedItem
  }
  relatedViews: {
    [viewId: string]: IControlRelatedField | IControlRelatedField[]
  }
}

export interface ILocalRenderTreeItem extends IRenderTreeItem {
  fields: IControlRelatedField | IControlRelatedField[]
}

export interface IControlRequestParams {
  variables: QueryVariable
  filters: string[]
}

export interface IMapItemControlRequestParams {
  [itemId: number]: IControlRequestParams
}

export interface IDistinctValueReqeustParams {
  columns: string[]
  filters?: string[]
  variables?: Array<{name: string, value: string | number}>
}

export type OnGetControlOptions = (
  controlKey: string,
  userOptions: boolean,
  paramsOrOptions: { [viewId: string]: IDistinctValueReqeustParams } | any[],
  itemId?: number
) => void

export type ControlOptions = Array<{
  [key: string]: Array<number | string>
}>

export interface IMapControlOptions {
  [controlKey: string]: ControlOptions
}

export type OnFilterControlValueChange = (
  control: IControlBase,
  value: number | string
) => void

export type OnFilterValueChange = (
  mapItemFilterValue: IMapItemControlRequestParams,
  filterKey: string
) => void

export function getDefaultGlobalControl (): IGlobalControl {
  const control: IGlobalControl = {
    key: uuid(8, 16),
    name: '新建控制器',
    type: FilterTypes.Select,
    interactionType: 'column',
    operator: FilterTypesOperatorSetting[FilterTypes.InputText][0],
    width: 0,
    relatedItems: {},
    relatedViews: {}
  }
  return control
}

export function getDefaultLocalControl (view: IFormedView): ILocalControl {
  const model = view.model || {}
  const modelList = Object.entries(model)
  const defaultFields = modelList[0]
  const control: ILocalControl = {
    key: uuid(8, 16),
    name: '新建控制器',
    type: FilterTypes.Select,
    interactionType: 'column',
    operator: FilterTypesOperatorSetting[FilterTypes.InputText][0],
    width: 0,
    fields: defaultFields && { name: defaultFields[0], type: defaultFields[1].sqlType }
  }
  return control
}

export function renderInputText (onChange) {
  return (
    <Input.Search placeholder="请输入" onPressEnter={onChange} />
  )
}

export function renderNumberRange (onChange) {
  return (
    <NumberRange onSearch={onChange} />
  )
}

export function renderSelect (control: IGlobalControl, onChange, options) {
  const { multiple } = control
  return (
    <Select
      showSearch
      allowClear
      placeholder="请选择"
      onChange={onChange}
      {...multiple && {mode: 'multiple'}}
    >
      {options.map((o) => {
        return typeof o === 'object'
          ? <Option key={o.value} value={o.value}>{o.text}</Option>
          : <Option key={o} value={o}>{o}</Option>
      })}
    </Select>
  )
}

export function renderTreeSelect (filter: IGlobalControl, onChange, options) {
  const { name, textColumn, valueColumn, parentColumn } = filter
  const treeData = options.map((item) => ({
    id: item[valueColumn],
    pId: item[parentColumn],
    value: item[valueColumn],
    title: item[textColumn]
  }))
  return (
    <TreeSelect
      showSearch
      allowClear
      multiple
      treeDataSimpleMode
      placeholder="请选择"
      treeData={treeData}
      onChange={onChange}
    />
  )
}

export function renderDate (filter: IGlobalControl, onChange, extraProps?) {
  const {
    Week,
    Month,
    Year,
    Datetime,
    DatetimeMinute
  } = DatePickerFormats
  if (filter.multiple) {
    return (
      <MultiDatePicker
        placeholder="请选择"
        format={filter.dateFormat}
        onChange={onChange}
      />
    )
  } else {
    switch (filter.dateFormat) {
      case Week:
        return (
          <WeekPicker
            className={styles.controlComponent}
            placeholder="请选择"
            onChange={onChange}
            {...extraProps}
          />
        )
      case Month:
      case Year:
        return (
          <MonthPicker
            className={styles.controlComponent}
            placeholder="请选择"
            format={filter.dateFormat}
            onChange={onChange}
            {...extraProps}
          />
        )
      default:
        const isDatetimePicker = [Datetime, DatetimeMinute].includes(filter.dateFormat)
        return (
          <DatePicker
            className={styles.controlComponent}
            placeholder="请选择"
            showTime={isDatetimePicker}
            format={filter.dateFormat}
            onChange={isDatetimePicker ? datetimePickerChange(onChange) : onChange}
            onOk={onChange}
            {...extraProps}
          />
        )
    }
  }
}

export function renderDateRange (filter, onChange) {
  const placeholder: [string, string] = ['从', '到']
  const { Datetime, DatetimeMinute } = DatePickerFormats
  const isDatetimePicker = [Datetime, DatetimeMinute].includes(filter.dateFormat)
  return (
    <RangePicker
      className={styles.controlComponent}
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

export function getVariableValue (filter: IControlBase, fields: IControlRelatedField | IControlRelatedField[], value) {
  const { type, dateFormat, multiple } = filter
  let name
  let valueType
  let variable = []

  if (value === void 0 || value === null) {
    return variable
  }

  if (!Array.isArray(fields)) {
    name = fields.name
    valueType = fields.type
  }

  switch (type) {
    case FilterTypes.InputText:
      variable.push({ name, value: getValidVariableValue(value, valueType) })
      break
    case FilterTypes.Select:
      if (multiple) {
        if (value.length && value.length > 0) {
          variable.push({ name, value: value.map((val) => getValidVariableValue(val, valueType)).join(',') })
        }
      } else {
        variable.push({ name, value: getValidVariableValue(value, valueType) })
      }
      break
    case FilterTypes.NumberRange:
      variable = value.reduce((arr, val, index) => {
        if (val !== '' && !isNaN(val)) {
          const { name, type: valueType } = fields[index]
          return arr.concat({ name, value: getValidVariableValue(val, valueType) })
        }
        return arr
      }, [])
      break
    // case FilterTypes.TreeSelect:
    //   if (value.length && value.length > 0) {
    //     variable.push({ name, value: value.map((val) => getValidVariableValue(val, valueType)).join(',') })
    //   }
    //   break
    case FilterTypes.Date:
      if (multiple) {
        variable.push({ name, value: value.split(',').map((v) => `'${v}'`).join(',') })
      } else {
        variable.push({ name, value: `'${moment(value).format(dateFormat)}'` })
      }
      break
    case FilterTypes.DateRange:
      if (value.length) {
        variable = value
          .map((v, index) => {
            const { name } = fields[index]
            return { name, value: `'${moment(v).format(dateFormat)}'` }
          })
      }
      break
    default:
      const val = value.target.value.trim()
      if (val) {
        variable.push({ name, value: getValidVariableValue(val, valueType) })
      }
      break
  }
  return variable
}

export function getModelValue (control: IControlBase, field: IControlRelatedField, value) {
  const { type, dateFormat, multiple, operator } = control
  const { name, type: sqlType } = field
  const filters = []

  if (value === void 0 || value === null) {
    return filters
  }

  switch (type) {
    case FilterTypes.InputText:
      filters.push(`${name} ${operator} ${getValidColumnValue(value, sqlType)}`)
      break
    case FilterTypes.Select:
      if (multiple) {
        if (value.length && value.length > 0) {
          filters.push(`${name} ${operator} (${value.map((val) => getValidColumnValue(val, sqlType)).join(',')})`)
        }
      } else {
        filters.push(`${name} ${operator} ${getValidColumnValue(value, sqlType)}`)
      }
      break
    case FilterTypes.NumberRange:
      if (value[0] !== '' && !isNaN(value[0])) {
        filters.push(`${name} >= ${getValidColumnValue(value[0], sqlType)}`)
      }
      if (value[1] !== '' && !isNaN(value[1])) {
        filters.push(`${name} <= ${getValidColumnValue(value[1], sqlType)}`)
      }
      break
    // case FilterTypes.TreeSelect:
    //   if (value.length && value.length > 0) {
    //     filters.push(`${name} ${operator} (${value.map((val) => getValidColumnValue(val, sqlType)).join(',')})`)
    //   }
    //   break
    case FilterTypes.Date:
      if (multiple) {
        filters.push(`${name} ${operator} (${value.split(',').map((val) => getValidColumnValue(val, sqlType)).join(',')})`)
      } else {
        filters.push(`${name} ${operator} ${getValidColumnValue(moment(value).format(dateFormat), sqlType)}`)
      }
      break
    case FilterTypes.DateRange:
      if (value.length) {
        filters.push(`${name} >= ${getValidColumnValue(moment(value[0]).format(dateFormat), sqlType)}`)
        filters.push(`${name} <= ${getValidColumnValue(moment(value[1]).format(dateFormat), sqlType)}`)
      }
      break
    default:
      const inputValue = value.target.value.trim()
      if (inputValue) {
        filters.push(`${name} ${operator} ${getValidColumnValue(inputValue, sqlType)}`)
      }
      break
  }

  return filters
}

export function getValidColumnValue (value, sqlType) {
  if (!value || !sqlType) { return value }
  return SQL_NUMBER_TYPES.includes(sqlType) ? value : `'${value}'`
}

export function getValidVariableValue (value, valueType: ViewVariableValueTypes) {
  switch (valueType) {
    case ViewVariableValueTypes.String:
    case ViewVariableValueTypes.Date:
      return `'${value}'`
    case ViewVariableValueTypes.Boolean:
      return !!value
    default:
      return value
  }
}

export function getDefaultValue (control: IControlBase) {
  const { type, dynamicDefaultValue, defaultValue } = control
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

export function getOperatorOptions (type: FilterTypes, multiple: boolean): OperatorTypes[] {
  const operatorTypes = FilterTypesOperatorSetting[type]
  switch (type) {
    case FilterTypes.Select:
    case FilterTypes.Date:
      return multiple ? operatorTypes['multiple'] : operatorTypes['normal']
    default:
      return operatorTypes as OperatorTypes[]
  }
}

export function getDatePickerFormatOptions (type: FilterTypes, multiple: boolean): DatePickerFormats[] {
  switch (type) {
    case FilterTypes.Date:
    case FilterTypes.DateRange:
      return multiple
        ? DatePickerFormatsSelectSetting['multiple']
        : DatePickerFormatsSelectSetting['normal']
    default:
      return []
  }
}

export function getControlRenderTree<T extends IControlBase, U extends IControlBase> (controls: T[]): {
  renderTree: U[],
  flatTree: {
    [key: string]: U
  }
} {
  const renderTree = []
  const flatTree = {}

  while (controls.length) {
    const control = controls[0]
    flatTree[control.key] = control
    if (control.parent) {
      if (!flatTree[control.parent]) {
        controls.push(control)
        controls.shift()
        continue
      }
      if (!flatTree[control.parent].children) {
        flatTree[control.parent].children = []
      }
      flatTree[control.parent].children.push(control)
    } else {
      renderTree.push(control)
    }
    controls.shift()
  }

  return {
    renderTree,
    flatTree
  }
}

export function getAllChildren (
  key: string,
  flatTree: { [key: string]: IRenderTreeItem }
) {
  let keys = []
  if (flatTree[key].children) {
    flatTree[key].children.forEach((c) => {
      keys = keys.concat(c.key).concat(getAllChildren(c.key, flatTree))
    })
  }
  return keys
}

export function getParents<T extends IControlBase> (
  parentKey: string,
  flatTree: {
    [key: string]: IRenderTreeItem
  }
): T[] {
  let parents = []
  const parent = flatTree[parentKey]
  if (parent) {
    const { children, ...rest } = parent
    parents = parents
      .concat({...rest})
      .concat(getParents(rest.parent, flatTree))
  }
  return parents
}

export function getRelatedFieldsInfo (
  view: IFormedView,
  type: FilterTypes,
  interactionType: InteractionType,
  fields: IControlRelatedField | IControlRelatedField[]
): {
  model: IViewModelProps[],
  variables: IViewVariable[],
  fields: IControlRelatedField | IControlRelatedField[]
} {
  const model = Object.entries(view.model)
    .filter(([k, v]: [string, IViewModelProps]) => v.modelType === 'category')
    .map(([k, v]: [string, IViewModelProps]) => ({
      name: k,
      ...v
    }))
  const variables = view.variable.filter((v) => v.type === ViewVariableTypes.Query)

  if (interactionType === 'column') {
    if (!fields) {
      fields = model.length
        ? {
          name: model[0].name,
          type: model[0].sqlType
        }
        : void 0
    }
  } else {
    if (!fields) {
      if (variables.length) {
        const fieldBase = {
          name: variables[0].name,
          type: variables[0].valueType
        }
        if (IS_RANGE_TYPE[type]) {
          fields = [fieldBase]
        } else if (type === FilterTypes.Select) {
          fields = {
            ...fieldBase,
            optionsFromColumn: false,
            column: model.length ? model[0].name : void 0
          }
        } else {
          fields = fieldBase
        }
      } else {
        fields = IS_RANGE_TYPE[type] ? [] : void 0
      }
    } else {
      fields = IS_RANGE_TYPE[type]
        ? [].concat(fields)
        : fields
    }
  }

  return {
    model,
    variables,
    fields
  }
}
