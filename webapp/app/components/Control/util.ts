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

import moment, { DurationInputArg2 } from 'moment'
import {
  IControl,
  IControlRelatedView,
  IRenderTreeItem,
  IFilter,
  IControlOption,
  IControlCondition
} from './types'
import { uuid } from 'app/utils/util'
import {
  ControlTypes,
  ControlTypesOperatorSetting,
  IS_RANGE_TYPE,
  ControlPanelTypes,
  DatePickerFormats,
  DatePickerFormatsSelectSetting,
  ControlFieldTypes,
  ControlDefaultValueTypes,
  ControlOptionTypes,
  ControlVisibilityTypes,
  IS_NUMBER_TYPE
} from './constants'
import { DEFAULT_CACHE_EXPIRED, SQL_NUMBER_TYPES } from 'app/globalConstants'
import {
  IFormedView,
  IViewModelProps,
  IViewVariable,
  IFormedViews,
  IViewModel
} from 'app/containers/View/types'
import {
  ViewVariableValueTypes,
  ViewVariableTypes,
  ViewModelTypes
} from 'app/containers/View/constants'
import OperatorTypes from 'app/utils/operatorTypes'
import { IFlatRelatedView } from './Config/ControlForm/types'
import { IDashboardItem, QueryVariable } from 'app/containers/Dashboard/types'
import { IWidgetFormed } from 'app/containers/Widget/types'
import { IRelativeDate } from '../RelativeDatePicker/types'
import { RelativeDateValueType } from '../RelativeDatePicker/constants'
import { TreeNode } from 'antd/lib/tree-select'

export function getDefaultGlobalControl(): IControl {
  const control: IControl = {
    key: uuid(8, 16),
    name: '新建控制器',
    type: ControlTypes.Select,
    operator: ControlTypesOperatorSetting[ControlTypes.Select].normal[0],
    optionType: ControlOptionTypes.Auto,
    defaultValueType: ControlDefaultValueTypes.Fixed,
    cache: false,
    expired: DEFAULT_CACHE_EXPIRED,
    width: 0,
    visibility: ControlVisibilityTypes.Visible,
    relatedItems: {},
    relatedViews: {}
  }
  return control
}

export function getDefaultLocalControl(view: IFormedView): IControl {
  const model = view.model || {}
  const modelList = Object.entries(model)
  const defaultFields = modelList[0]
  const control: IControl = {
    key: uuid(8, 16),
    name: '新建控制器',
    type: ControlTypes.Select,
    operator: ControlTypesOperatorSetting[ControlTypes.Select].normal[0],
    optionType: ControlOptionTypes.Auto,
    defaultValueType: ControlDefaultValueTypes.Fixed,
    cache: false,
    expired: DEFAULT_CACHE_EXPIRED,
    width: 0,
    visibility: ControlVisibilityTypes.Visible,
    relatedViews: {
      [view.id]: {
        fieldType: ControlFieldTypes.Column,
        fields: defaultFields && [defaultFields[0]]
      }
    }
  }
  return control
}

export function getVariableParams(
  control: IControl,
  fields: string[],
  value,
  variables: IViewVariable[]
) {
  const { type, dateFormat, multiple } = control
  const fieldsVariables = fields
    .map((name) => variables.find((v) => v.name === name))
    .filter((f) => !!f)
  let params = []

  if (
    value === void 0 ||
    value === null ||
    (typeof value === 'string' && !value.trim()) ||
    !fieldsVariables.length
  ) {
    return params
  }

  switch (type) {
    case ControlTypes.InputText:
    case ControlTypes.Radio:
      params = fieldsVariables.map(({ name, valueType }) => ({
        name,
        value: getValidVariableValue(value, valueType)
      }))
      break
    case ControlTypes.Select:
    case ControlTypes.TreeSelect:
      if (multiple) {
        if (value.length && value.length > 0) {
          params = fieldsVariables.map(({ name, valueType }) => ({
            name,
            value: value
              .map((val) => getValidVariableValue(val, valueType))
              .join(',')
          }))
        }
      } else {
        params = fieldsVariables.map(({ name, valueType }) => ({
          name,
          value: getValidVariableValue(value, valueType)
        }))
      }
      break
    case ControlTypes.NumberRange:
    case ControlTypes.Slider:
      params = value.reduce((arr, val, index) => {
        if (fieldsVariables[index] && val !== '' && !isNaN(val)) {
          const { name, valueType } = fieldsVariables[index]
          return arr.concat({
            name,
            value: getValidVariableValue(val, valueType)
          })
        }
        return arr
      }, [])
      break
    case ControlTypes.Date:
      if (multiple) {
        params = fieldsVariables.map(({ name }) => ({
          name,
          value: value
            .split(',')
            .map((v) => `'${v}'`)
            .join(',')
        }))
      } else {
        params = fieldsVariables.map(({ name }) => ({
          name,
          value: `'${moment(value).format(dateFormat)}'`
        }))
      }
      break
    case ControlTypes.DateRange:
      if (value.length) {
        params = value
          .map((v, index) => {
            return fieldsVariables[index]
              ? {
                  name: fieldsVariables[index].name,
                  value: `'${moment(v).format(dateFormat)}'`
                }
              : null
          })
          .filter((p) => p)
      }
      break
    default:
      const val = value.target.value.trim()
      if (val) {
        params = fieldsVariables.map(({ name, valueType }) => ({
          name,
          value: getValidVariableValue(val, valueType)
        }))
      }
      break
  }
  return params
}

export function getCustomOptionVariableParams(
  control: IControl,
  viewId: number,
  value,
  variables: IViewVariable[]
): QueryVariable {
  const { customOptions } = control
  let params = []

  if (
    value === void 0 ||
    value === null ||
    (typeof value === 'string' && !value.trim())
  ) {
    return params
  }

  Array.from([])
    .concat(value)
    .forEach((val) => {
      const selectedOption = customOptions.find((o) => o.value === val)
      if (selectedOption && selectedOption.variables[viewId]) {
        params = params.concat(
          getVariableParams(
            { ...control, multiple: false },
            [selectedOption.variables[viewId]],
            val,
            variables
          )
        )
      }
    })

  return params
}

// 全局过滤器 与 组件控制器 filter 操作
export function getFilterParams(
  control: IControl,
  fields: string[],
  value,
  models: IViewModel
) {
  const { type, dateFormat, multiple, operator } = control // select  ''  true in
  // filter is related with only one field
  const filterFieldName = fields[0]
  const filters = []

  if (
    value === void 0 ||
    value === null ||
    (typeof value === 'string' && !value.trim()) ||
    !models[filterFieldName]
  ) {
    return filters
  }

  const { sqlType } = models[filterFieldName]
  const filterBase: IFilter = {
    name: filterFieldName,
    type: 'filter',
    value: getValidColumnValue(value, sqlType),
    sqlType,
    operator
  }
  switch (type) {
    case ControlTypes.InputText:
    case ControlTypes.Radio:
      filters.push(filterBase)
      break
    case ControlTypes.Select:
    case ControlTypes.TreeSelect:
      if (multiple) {
        if (Array.isArray(value) && value.length > 0) {
          filters.push({
            ...filterBase,
            value: value.map((val) => getValidColumnValue(val, sqlType))
          })
        }
      } else {
        filters.push(filterBase)
      }
      break
    case ControlTypes.NumberRange:
    case ControlTypes.Slider:
      value.forEach((val, index) => {
        if (val !== '' && !isNaN(val)) {
          filters.push({
            ...filterBase,
            operator: !index ? '>=' : '<=',
            value: getValidColumnValue(val, sqlType)
          })
        }
      })
      break
    case ControlTypes.Date:
      filters.push({
        ...filterBase,
        value: multiple
          ? value.split(',').map((val) => getValidColumnValue(val, sqlType))
          : getValidColumnValue(moment(value).format(dateFormat), sqlType)
      })
      break
    case ControlTypes.DateRange:
      if (value.length) {
        value.forEach((val, index) => {
          filters.push({
            ...filterBase,
            operator: !index ? '>=' : '<=',
            value: getValidColumnValue(moment(val).format(dateFormat), sqlType)
          })
        })
      }
      break
    default:
      const inputValue = value.target.value.trim()
      if (inputValue) {
        filters.push({
          ...filterBase,
          value: getValidColumnValue(inputValue, sqlType)
        })
      }
      break
  }

  return filters
}

export function getValidColumnValue(value, sqlType) {
  if (!value || !sqlType) {
    return value
  }
  return SQL_NUMBER_TYPES.includes(sqlType) ? value : `'${value}'`
}

export function getValidVariableValue(
  value,
  valueType: ViewVariableValueTypes
) {
  switch (valueType) {
    case ViewVariableValueTypes.String:
    case ViewVariableValueTypes.Date:
      return `'${value}'`
    case ViewVariableValueTypes.Boolean:
      if (typeof value === 'string') {
        if (value.toLowerCase() === 'false' || value.trim() === '') {
          return false
        } else {
          return true
        }
      } else {
        return !!value
      }
    default:
      return value
  }
}

export function transformRelativeDateValue(val: IRelativeDate) {
  const { type, value, valueType } = val
  return valueType === RelativeDateValueType.Prev
    ? moment()
        .subtract(value, `${type}s` as DurationInputArg2)
        .startOf(type)
    : moment()
        .add(value, `${type}s` as DurationInputArg2)
        .startOf(type)
}

export function getPreciseDefaultValue(control: IControl) {
  const { type, defaultValueType, defaultValue, multiple } = control
  switch (type) {
    case ControlTypes.DateRange:
      return defaultValueType === ControlDefaultValueTypes.Dynamic
        ? defaultValue.map((val) => transformRelativeDateValue(val))
        : Array.isArray(defaultValue)
        ? defaultValue.map((val) => moment(val))
        : defaultValue
    case ControlTypes.Date:
      if (defaultValue) {
        return defaultValueType === ControlDefaultValueTypes.Dynamic
          ? transformRelativeDateValue(defaultValue)
          : multiple
          ? defaultValue
          : moment(defaultValue)
      }
    default:
      return defaultValue
  }
}

export function stringifyDefaultValue(
  control: Partial<IControl>,
  defaultValue: any,
  defaultValueStart: IRelativeDate,
  defaultValueEnd: IRelativeDate
) {
  const { type, dateFormat, defaultValueType, multiple } = control
  switch (type) {
    case ControlTypes.DateRange:
      return defaultValueType === ControlDefaultValueTypes.Fixed
        ? Array.isArray(defaultValue)
          ? defaultValue.map((val) => val.format(dateFormat))
          : defaultValue
        : [defaultValueStart, defaultValueEnd]
    case ControlTypes.Date:
      return defaultValueType === ControlDefaultValueTypes.Fixed &&
        !multiple &&
        defaultValue
        ? defaultValue.format(dateFormat)
        : defaultValue
    default:
      return defaultValue
  }
}

export function parseDefaultValue(control: Partial<IControl>) {
  const { type, defaultValue, defaultValueType, multiple } = control
  switch (type) {
    case ControlTypes.DateRange:
      return defaultValueType === ControlDefaultValueTypes.Fixed
        ? Array.isArray(defaultValue)
          ? { defaultValue: defaultValue.map((val) => moment(val)) }
          : { defaultValue }
        : {
            defaultValueStart: defaultValue[0],
            defaultValueEnd: defaultValue[1]
          }
    case ControlTypes.Date:
      return defaultValueType === ControlDefaultValueTypes.Fixed &&
        !multiple &&
        defaultValue
        ? { defaultValue: moment(defaultValue) }
        : { defaultValue }
    default:
      return { defaultValue }
  }
}

export function transformOptions(
  control: IControl,
  options: object[]
): IControlOption[] | TreeNode[] {
  switch (control.type) {
    case ControlTypes.Select:
    case ControlTypes.Radio:
      switch (control.optionType) {
        case ControlOptionTypes.Auto:
          return Object.values(
            options.reduce((obj, o) => {
              Object.values(control.relatedViews).forEach(({ fields }) => {
                const value = o[fields[0]]
                if (value !== void 0 && !obj[value]) {
                  obj[value] = { value, text: value }
                }
              })
              return obj
            }, {})
          )
        case ControlOptionTypes.Manual:
          const { valueField, textField } = control
          return Object.values(
            options.reduce((obj, o) => {
              const value = o[valueField]
              if (!obj[value]) {
                obj[value] = {
                  value,
                  text: textField ? o[textField] : o[valueField]
                }
              }
              return obj
            }, {})
          )
        default:
          return options as IControlOption[]
      }
    case ControlTypes.TreeSelect:
      const { valueField, textField, parentField } = control
      return options.map((o) => ({
        id: o[valueField],
        pId: o[parentField],
        value: o[valueField],
        title: textField ? o[textField] : o[valueField]
      }))
    default:
      return []
  }
}

export function getOperatorOptions(
  type: ControlTypes,
  multiple: boolean
): OperatorTypes[] {
  const operatorTypes = ControlTypesOperatorSetting[type]
  switch (type) {
    case ControlTypes.Select:
    case ControlTypes.Date:
    case ControlTypes.TreeSelect:
      return multiple ? operatorTypes['multiple'] : operatorTypes['normal']
    default:
      return operatorTypes as OperatorTypes[]
  }
}

export function getValidOperator(
  operator: OperatorTypes,
  type: ControlTypes,
  multiple: boolean
): OperatorTypes {
  const options = getOperatorOptions(type, multiple)
  return options.includes(operator) ? operator : options[0]
}

export function getDatePickerFormatOptions(
  type: ControlTypes,
  multiple: boolean
): DatePickerFormats[] {
  switch (type) {
    case ControlTypes.Date:
    case ControlTypes.DateRange:
      return multiple
        ? DatePickerFormatsSelectSetting['multiple']
        : DatePickerFormatsSelectSetting['normal']
    default:
      return []
  }
}

export function getValidDatePickerFormat(
  dateFormat: DatePickerFormats,
  type: ControlTypes,
  multiple: boolean
): DatePickerFormats {
  const options = getDatePickerFormatOptions(type, multiple)
  return options.includes(dateFormat) ? dateFormat : options[0]
}

export function getControlRenderTree(
  controls: IControl[]
): {
  renderTree: IRenderTreeItem[]
  flatTree: {
    [key: string]: IRenderTreeItem
  }
} {
  const renderTree = []
  const flatTree = {}

  while (controls.length) {
    const control = { ...controls[0] }
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

export function getAllChildren(
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

export function getParents(
  parentKey: string,
  flatTree: {
    [key: string]: IRenderTreeItem
  }
): IRenderTreeItem[] {
  let parents = []
  const parent = flatTree[parentKey]
  if (parent) {
    const { children, ...rest } = parent
    parents = parents
      .concat({ ...rest })
      .concat(getParents(rest.parent, flatTree))
  }
  return parents
}

export function getRelatedViewModels(
  view: IFormedView,
  type: ControlTypes
): IViewModelProps[] {
  return Object.entries(view.model)
    .filter(([k, v]: [string, IViewModelProps]) => {
      return IS_NUMBER_TYPE[type]
        ? v.modelType === ViewModelTypes.Value
        : v.modelType === ViewModelTypes.Category
    })
    .map(([k, v]: [string, IViewModelProps]) => ({
      name: k,
      ...v
    }))
}

export function getDefaultRelatedView(
  view: IFormedView,
  type: ControlTypes,
  relatedView?: IControlRelatedView
): IFlatRelatedView {
  const { id, name } = view
  const models = getRelatedViewModels(view, type)
  const variables = view.variable.filter(
    (v) => v.type === ViewVariableTypes.Query
  )

  return {
    id,
    name,
    models,
    variables,
    ...(relatedView || {
      fieldType: ControlFieldTypes.Column,
      fields: void 0,
      operator: ControlTypesOperatorSetting[ControlTypes.Select].normal[0]
    })
  }
}

export function getEditingControlFormValues(
  control: IControl,
  formedViews?: IFormedViews,
  currentItems?: IDashboardItem[],
  widgets?: IWidgetFormed[]
) {
  if (control) {
    const { relatedItems, relatedViews, ...editingControlBase } = control
    const editingRelatedItemList = []
    const checkedViews = []

    if (currentItems && relatedItems) {
      currentItems.forEach((item) => {
        const widget = widgets.find((w) => w.id === item.widgetId)
        const checked = relatedItems[item.id]
          ? relatedItems[item.id].checked && !!relatedViews[widget.viewId]
          : false

        editingRelatedItemList.push({
          id: item.id,
          name: widget.name,
          viewId: widget.viewId,
          checked
        })

        if (checked && !checkedViews.includes(widget.viewId)) {
          checkedViews.push(widget.viewId)
        }
      })
    } else {
      const [viewId, relatedView] = Object.entries(relatedViews)[0]
      checkedViews.push(viewId)
    }

    const editingRelatedViewList = checkedViews.map((viewId) => {
      const view = formedViews[viewId]
      const relatedView = relatedViews[viewId]
      return getDefaultRelatedView(view, editingControlBase.type, relatedView)
    })

    return {
      editingControlBase,
      editingRelatedItemList,
      editingRelatedViewList
    }
  } else {
    return {
      editingControlBase: null,
      editingRelatedItemList: [],
      editingRelatedViewList: []
    }
  }
}

export function getPanelRenderState(
  type: ControlPanelTypes,
  controls: IControl[],
  items: string
) {
  const validControls: IControl[] = []
  const itemIds = items.split(',')
  const defaultValues = {}

  controls.forEach((control) => {
    defaultValues[control.key] = getPreciseDefaultValue(control)
    validControls.push({
      ...control,
      ...(type === ControlPanelTypes.Global && {
        relatedItems: Object.entries(control.relatedItems).reduce(
          (obj, [id, item]) => {
            if (itemIds.includes(id)) {
              obj[id] = item
            }
            return obj
          },
          {}
        )
      })
    })
  })

  const { renderTree, flatTree } = getControlRenderTree(validControls)

  return {
    renderTree,
    flatTree,
    defaultValues
  }
}

export function getControlConditionValue(
  controls: IControl[],
  conditions: IControlCondition[],
  controlValues: object
): boolean {
  const condition = conditions[0]
  if (condition) {
    const { control: conditionControlKey, operator, value } = condition
    if (conditionControlKey && operator && value) {
      const conditionControl = controls.find(
        (c) => c.key === conditionControlKey
      )
      if (conditionControl) {
        switch (operator) {
          case OperatorTypes.Equal:
            return controlValues[conditionControlKey] === value
          case OperatorTypes.NotEqual:
            return controlValues[conditionControlKey] !== value
          case OperatorTypes.In:
            return controlValues[conditionControlKey].includes(value)
          case OperatorTypes.NotIn:
            return !controlValues[conditionControlKey].includes(value)
        }
      }
    }
  }
  return false
}

export function getControlVisibility(
  controls: IControl[],
  control: IControl,
  controlValues: object
): boolean {
  const { visibility, conditions } = control
  switch (visibility) {
    case ControlVisibilityTypes.Conditional:
      return getControlConditionValue(controls, conditions, controlValues)
    case ControlVisibilityTypes.Visible:
      return true
    case ControlVisibilityTypes.Hidden:
      return false
  }
}

export function cleanInvisibleConditionalControlValues(
  controls: IControl[],
  changingControl: IControl,
  controlValues: object
): object {
  const updatedValues = {}
  controls.forEach((c) => {
    if (
      c.visibility === ControlVisibilityTypes.Conditional &&
      c.conditions[0] &&
      c.conditions[0].control === changingControl.key &&
      getControlConditionValue(controls, c.conditions, controlValues)
    ) {
      updatedValues[c.key] = getPreciseDefaultValue(c)
    }
  })
  return updatedValues
}
