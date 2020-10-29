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

import {
  IControl,
  IControlRelatedView,
  IControlOption
} from 'app/components/Control/types'
import {
  ControlFieldTypes,
  ControlTypes,
  ControlOptionTypes,
  ControlDefaultValueTypes,
  ControlVisibilityTypes
} from 'app/components/Control/constants'
import { ViewVariableValueTypes } from 'app/containers/View/constants'
import { DEFAULT_CACHE_EXPIRED, SqlTypes } from 'app/globalConstants'
import { IRelativeDate } from 'app/components/RelativeDatePicker/types'
import {
  RelativeDateType,
  RelativeDateValueType
} from 'app/components/RelativeDatePicker/constants'

function beta5(control: ILegacyGlobalControl): ILegacyGlobalControl
function beta5(control: ILegacyLocalControl): ILegacyLocalControl
function beta5(control: IControl): IControl
function beta5(control) {
  /* IGlobalControl & ILocalControl:
   *   1. + cache
   *   2. + expired
   */
  const { type, cache, expired } = control
  if (
    type === ControlTypes.Select &&
    (cache === void 0 || expired === void 0)
  ) {
    return {
      ...control,
      cache: false,
      expired: DEFAULT_CACHE_EXPIRED
    }
  }
  return control
}

function beta9(
  control: ILegacyGlobalControl | ILegacyLocalControl | IControl,
  opts
) {
  /*
   * IGlobalControl
   *       &          -->    IControl
   * ILocalControl
   *
   * IControl:
   *   1. - interactionType(move it into each `relatedViews` and rename to `fieldType`)
   *   2. + optionType, optional
   *   3. + valueViewId, optional
   *   4. + valueField, optional
   *   5. + textField, optional
   *   6. + parentField, optional
   *   7. customOptions: change type to IControlOption[]
   *   8. - options, options -> customOptions
   *   9. + optionWithVariable, optional
   *   10. + defaultValueType
   *   11. + radioType, optional
   *   12. + min, optional
   *   13. + max, optional
   *   14. + step, optional
   *   15. + label, optional
   *   16. - dynamicDefaultValue, values transform as
   *     a. 'custom' -> just set defaultValueType to ControlDefaultValueType.Fixed
   *     b. others -> transform to defaultValue, and set defaultValueType to ControlDefaultValueType.Dynamic
   *   17. + visibility
   *   18. + conditions, optional
   *   19. relatedViews: change type to IControlRelatedView
   * IControlRelatedView:
   *   1. + fieldType
   *   2. + fields
   *   3. name -> fields(element)
   *   4. - type
   *   5. - optionsFromColumn(move each relatedViews[first-view-id].optionsFromColumn -> autoGetOptionsFromRelatedViews)
   *   6. - column(move each relatedViews[first-view-id].column -> valueField)
   *   7. structure change
   *     old
   *       [viewId]: { name: 'foo', type: 'VARCHAR' }
   *     recent
   *       [viewId]: {
   *         fieldType: 'column',
   *         fields: ['foo']
   *       }
   *
   *     old
   *       [viewId]: [
   *         { name: 'foo', type: 'date' },
   *         { name: 'bar', type: 'date' }
   *       ]
   *     recent
   *       [viewId]: {
   *         fieldType: 'variable',
   *         fields: ['foo', 'bar']
   *       }
   */
  if ((control as ILegacyGlobalControl | ILegacyLocalControl).interactionType) {
    if ((control as ILegacyLocalControl).fields) {
      const {
        interactionType,
        customOptions,
        options,
        dynamicDefaultValue,
        defaultValue,
        fields,
        ...rest
      } = control as ILegacyLocalControl
      const { relatedView, valueInfo } = beta9FieldsTransform(
        fields,
        rest.type,
        interactionType,
        customOptions,
        options,
        opts.viewId
      )
      return {
        ...rest,
        relatedViews: {
          [opts.viewId]: relatedView
        },
        ...(valueInfo && valueInfo),
        ...beta9DefaultValueTransform(
          rest.type,
          dynamicDefaultValue,
          defaultValue
        ),
        visibility: ControlVisibilityTypes.Visible
      }
    } else {
      const {
        interactionType,
        relatedViews,
        customOptions,
        options,
        dynamicDefaultValue,
        defaultValue,
        ...rest
      } = control as ILegacyGlobalControl
      const migratedRelatedViews = {}
      let valueFieldInfo

      Object.entries(relatedViews).forEach(([key, value], index) => {
        const { relatedView, valueInfo } = beta9FieldsTransform(
          value,
          rest.type,
          interactionType,
          customOptions,
          options,
          key
        )
        migratedRelatedViews[key] = relatedView
        if (!index) {
          valueFieldInfo = valueInfo
        }
      })
      return {
        relatedViews: migratedRelatedViews,
        ...rest,
        ...(valueFieldInfo && valueFieldInfo),
        ...beta9DefaultValueTransform(
          rest.type,
          dynamicDefaultValue,
          defaultValue
        ),
        visibility: ControlVisibilityTypes.Visible
      }
    }
  } else {
    return control as IControl
  }
}

function beta9FieldsTransform(
  fields: ILegacyControlRelatedField | ILegacyControlRelatedField[],
  controlType: ControlTypes,
  interactionType: ControlFieldTypes,
  customOptions: boolean,
  options: IControlOption[],
  valueViewId: string
): {
  relatedView: IControlRelatedView
  valueInfo?: Pick<
    IControl,
    | 'optionType'
    | 'customOptions'
    | 'valueViewId'
    | 'valueField'
    | 'optionWithVariable'
  >
} {
  if (Array.isArray(fields)) {
    return {
      relatedView: {
        fieldType: interactionType,
        fields: fields.map(({ name }) => name)
      }
    }
  } else {
    const { name, type, optionsFromColumn, column } = fields

    let valueInfo: Pick<
      IControl,
      | 'optionType'
      | 'customOptions'
      | 'valueViewId'
      | 'valueField'
      | 'optionWithVariable'
    > = {}

    if (controlType === ControlTypes.Select) {
      if (interactionType === ControlFieldTypes.Variable && optionsFromColumn) {
        valueInfo = {
          optionType: ControlOptionTypes.Manual,
          valueViewId: Number(valueViewId),
          valueField: column
        }
      } else {
        valueInfo = {
          optionType: customOptions
            ? ControlOptionTypes.Custom
            : ControlOptionTypes.Auto,
          customOptions: customOptions ? options : void 0,
          ...(customOptions && { optionWithVariable: false })
        }
      }
    }

    return {
      relatedView: {
        fieldType: interactionType,
        fields: [name]
      },
      valueInfo
    }
  }
}

function beta9DefaultValueTransform(
  type: ControlTypes,
  dynamicDefaultValue: any,
  defaultValue: any
): {
  defaultValueType: ControlDefaultValueTypes
  defaultValue: any
} {
  if (type === ControlTypes.Date) {
    if (
      !dynamicDefaultValue ||
      dynamicDefaultValue === LegacyDatePickerDefaultValues.Custom
    ) {
      return {
        defaultValueType: ControlDefaultValueTypes.Fixed,
        defaultValue
      }
    } else {
      let transformed: IRelativeDate
      switch (dynamicDefaultValue) {
        case LegacyDatePickerDefaultValues.Today:
          transformed = {
            valueType: RelativeDateValueType.Current,
            value: 0,
            type: RelativeDateType.Day
          }
          break
        case LegacyDatePickerDefaultValues.Yesterday:
          transformed = {
            valueType: RelativeDateValueType.Prev,
            value: 1,
            type: RelativeDateType.Day
          }
          break
        case LegacyDatePickerDefaultValues.Week:
          transformed = {
            valueType: RelativeDateValueType.Current,
            value: 0,
            type: RelativeDateType.Week
          }
          break
        case LegacyDatePickerDefaultValues.Day7:
          transformed = {
            valueType: RelativeDateValueType.Prev,
            value: 7,
            type: RelativeDateType.Day
          }
          break
        case LegacyDatePickerDefaultValues.LastWeek:
          transformed = {
            valueType: RelativeDateValueType.Prev,
            value: 1,
            type: RelativeDateType.Week
          }
          break
        case LegacyDatePickerDefaultValues.Month:
          transformed = {
            valueType: RelativeDateValueType.Current,
            value: 0,
            type: RelativeDateType.Month
          }
          break
        case LegacyDatePickerDefaultValues.Day30:
          transformed = {
            valueType: RelativeDateValueType.Prev,
            value: 30,
            type: RelativeDateType.Day
          }
          break
        case LegacyDatePickerDefaultValues.LastMonth:
          transformed = {
            valueType: RelativeDateValueType.Prev,
            value: 1,
            type: RelativeDateType.Month
          }
          break
        case LegacyDatePickerDefaultValues.Quarter:
          transformed = {
            valueType: RelativeDateValueType.Current,
            value: 0,
            type: RelativeDateType.Quarter
          }
          break
        case LegacyDatePickerDefaultValues.Day90:
          transformed = {
            valueType: RelativeDateValueType.Prev,
            value: 90,
            type: RelativeDateType.Day
          }
          break
        case LegacyDatePickerDefaultValues.LastQuarter:
          transformed = {
            valueType: RelativeDateValueType.Prev,
            value: 1,
            type: RelativeDateType.Quarter
          }
          break
        case LegacyDatePickerDefaultValues.Year:
          transformed = {
            valueType: RelativeDateValueType.Current,
            value: 0,
            type: RelativeDateType.Year
          }
          break
        case LegacyDatePickerDefaultValues.Day365:
          transformed = {
            valueType: RelativeDateValueType.Prev,
            value: 365,
            type: RelativeDateType.Day
          }
          break
        case LegacyDatePickerDefaultValues.LastYear:
          transformed = {
            valueType: RelativeDateValueType.Prev,
            value: 1,
            type: RelativeDateType.Year
          }
          break
      }
      return {
        defaultValueType: ControlDefaultValueTypes.Dynamic,
        defaultValue: transformed
      }
    }
  } else {
    return {
      defaultValueType: ControlDefaultValueTypes.Fixed,
      defaultValue: void 0
    }
  }
}

/*
 * legacy types
 */

interface ILegacyControlBase
  extends Omit<IControl, 'relatedViews' | 'customOptions'> {
  interactionType: ControlFieldTypes
  customOptions?: boolean
  options?: IControlOption[]
  dynamicDefaultValue?: any
}

interface ILegacyGlobalControl extends ILegacyControlBase {
  relatedViews: {
    [viewId: string]: ILegacyControlRelatedField | ILegacyControlRelatedField[]
  }
}

interface ILegacyLocalControl extends ILegacyControlBase {
  fields: ILegacyControlRelatedField | ILegacyControlRelatedField[]
}

interface ILegacyControlRelatedField extends IControlRelatedView {
  name: string
  type: SqlTypes | ViewVariableValueTypes
  optionsFromColumn?: boolean
  column?: string
}

enum LegacyDatePickerDefaultValues {
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

export default {
  beta5,
  beta9
}
