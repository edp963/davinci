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

import moment from 'moment'
import {
  IGlobalControl,
  ILocalControl,
  IControlBase,
  IControlRelatedField,
  IRenderTreeItem,
  InteractionType,
  IFilters
} from './types'
import { uuid } from 'app/utils/util'
import FilterTypes, { FilterTypesOperatorSetting, IS_RANGE_TYPE } from './filterTypes'
import { DEFAULT_CACHE_EXPIRED, SQL_NUMBER_TYPES, SQL_DATE_TYPES } from 'app/globalConstants'
import { IFormedView, IViewModelProps, IViewVariable } from 'app/containers/View/types'
import { ViewVariableValueTypes, ViewVariableTypes, ViewModelTypes } from 'app/containers/View/constants'
import DatePickerFormats, { DatePickerDefaultValues, DatePickerFormatsSelectSetting } from './datePickerFormats'
import OperatorTypes from 'app/utils/operatorTypes'

export function getDefaultGlobalControl (): IGlobalControl {
  const control: IGlobalControl = {
    key: uuid(8, 16),
    name: '新建控制器',
    type: FilterTypes.Select,
    interactionType: 'column',
    operator: FilterTypesOperatorSetting[FilterTypes.InputText][0],
    cache: false,
    expired: DEFAULT_CACHE_EXPIRED,
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
    cache: false,
    expired: DEFAULT_CACHE_EXPIRED,
    width: 0,
    fields: defaultFields && { name: defaultFields[0], type: defaultFields[1].sqlType }
  }
  return control
}

export function getVariableValue (filter: IControlBase, fields: IControlRelatedField | IControlRelatedField[], value) {
  const { type, dateFormat, multiple } = filter
  let name
  let valueType
  let variable = []

  if (value === void 0
      || value === null
      || typeof value === 'string' && !value.trim()) {
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

// 全局过滤器 与 本地控制器 filter 操作
export function getModelValue (control: IControlBase, field: IControlRelatedField, value) {
  const { type, dateFormat, multiple, operator } = control  // select  ''  true in
  const { name, type: sqlType } = field
  const filters = []
  if (value === void 0
      || value === null
      || typeof value === 'string' && !value.trim()) {
    return filters
  }

  const commanFilterJson: IFilters = {
    name,
    type: 'filter',
    value: getValidColumnValue(value, sqlType),
    sqlType,
    operator
  }
  switch (type) {
    case FilterTypes.InputText:
      filters.push(commanFilterJson)
      break
    case FilterTypes.Select:
      if (multiple) {
        if (value.length && value.length > 0) {
          const filterJson = {
            ...commanFilterJson,
            value: value.map((val) => getValidColumnValue(val, sqlType))
          }
          filters.push(filterJson)
        }
      } else {
          filters.push(commanFilterJson)
      }
      break
    case FilterTypes.NumberRange:
      if (value[0] !== '' && !isNaN(value[0])) {
        const filterJson = {
          ...commanFilterJson,
          operator: '>=',
          value: getValidColumnValue(value[0], sqlType)
        }
        filters.push(filterJson)
      }
      if (value[1] !== '' && !isNaN(value[1])) {
        const filterJson = {
          ...commanFilterJson,
          operator: '<=',
          value: getValidColumnValue(value[1], sqlType)
        }
        filters.push(filterJson)
      }
      break
    // case FilterTypes.TreeSelect:
    //   if (value.length && value.length > 0) {
    //     filters.push(`${name} ${operator} (${value.map((val) => getValidColumnValue(val, sqlType)).join(',')})`)
    //   }
    //   break
    case FilterTypes.Date:
      if (multiple) {
        const filterJson = {
          ...commanFilterJson,
          value: value.split(',').map((val) => getValidColumnValue(val, sqlType))
        }
        filters.push(filterJson)
      } else {
        const filterJson = {
          ...commanFilterJson,
          value: getValidColumnValue(moment(value).format(dateFormat), sqlType)
        }
        filters.push(filterJson)
      }
      break
    case FilterTypes.DateRange:
      if (value.length) {
        const filterJson1 = {
          ...commanFilterJson,
          operator: '>=',
          value: getValidColumnValue(moment(value[0]).format(dateFormat), sqlType)
        }
        const filterJson2 = {
          ...commanFilterJson,
          operator: '<=',
          value: getValidColumnValue(moment(value[1]).format(dateFormat), sqlType)
        }
        filters.push(filterJson1)
        filters.push(filterJson2)
      }
      break
    default:
      const inputValue = value.target.value.trim()
      const filterJson = {
        ...commanFilterJson,
        value: getValidColumnValue(inputValue, sqlType)
      }
      if (inputValue) {
        filters.push(filterJson)
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

export function deserializeDefaultValue (control: IControlBase) {
  const { type, dynamicDefaultValue, defaultValue, multiple } = control
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
            return moment().subtract(1, 'months').startOf('month')
          case DatePickerDefaultValues.Quarter:
            return moment().startOf('quarter')
          case DatePickerDefaultValues.Day90:
            return moment().subtract(90, 'days')
          case DatePickerDefaultValues.LastQuarter:
            return moment().subtract(1, 'quarters').startOf('quarter')
          case DatePickerDefaultValues.Year:
            return moment().startOf('year')
          case DatePickerDefaultValues.Day365:
            return moment().subtract(365, 'days')
          case DatePickerDefaultValues.LastYear:
            return moment().subtract(1, 'years').startOf('year')
          default:
            return multiple ? defaultValue : defaultValue && moment(defaultValue)
        }
      } else {
        return null
      }
    default:
      return defaultValue
  }
}

export function serializeDefaultValue (
  control: IControlBase,
  value
) {
  const { type, dateFormat, multiple } = control
  if (type === FilterTypes.Date && !multiple) {
    return value && value.format(dateFormat)
  } else {
    return value
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
    .filter(([k, v]: [string, IViewModelProps]) => {
      return type === FilterTypes.NumberRange
        ? v.modelType === ViewModelTypes.Value
        : v.modelType === ViewModelTypes.Category
    })
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
