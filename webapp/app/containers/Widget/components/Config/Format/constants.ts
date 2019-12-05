import { IFieldFormatConfig } from './types'
import { ViewModelVisualTypes } from 'containers/View/constants'

export enum FieldFormatTypes {
  Default = 'default',
  Numeric = 'numeric',
  Currency = 'currency',
  Percentage = 'percentage',
  ScientificNotation = 'scientificNotation',
  Date = 'date',
  Custom = 'custom'
}

export const FieldFormatTypesSetting = {
  [ViewModelVisualTypes.Date]: [FieldFormatTypes.Default, FieldFormatTypes.Date],
  [ViewModelVisualTypes.Number]: [
    FieldFormatTypes.Default,
    FieldFormatTypes.Numeric,
    FieldFormatTypes.Currency,
    FieldFormatTypes.Percentage,
    FieldFormatTypes.ScientificNotation
  ]
}

export const FieldFormatTypesLocale = {
  [FieldFormatTypes.Default]: '默认',
  [FieldFormatTypes.Numeric]: '数值',
  [FieldFormatTypes.Currency]: '货币',
  [FieldFormatTypes.Percentage]: '百分比',
  [FieldFormatTypes.ScientificNotation]: '科学型',
  [FieldFormatTypes.Date]: '日期',
  [FieldFormatTypes.Custom]: '自定义'
}

export enum NumericUnit {
  None = '无',
  TenThousand = '万',
  OneHundredMillion = '亿',
  Thousand = 'k',
  Million = 'M',
  Giga = 'G'
}

export const NumericUnitList = [
  NumericUnit.None,
  NumericUnit.TenThousand,
  NumericUnit.OneHundredMillion,
  NumericUnit.Thousand,
  NumericUnit.Million,
  NumericUnit.Giga
]

export const defaultFormatConfig: IFieldFormatConfig = {
  formatType: FieldFormatTypes.Default,
  [FieldFormatTypes.Numeric]: {
    decimalPlaces: 2,
    unit: NumericUnit.None,
    useThousandSeparator: true
  },
  [FieldFormatTypes.Currency]: {
    decimalPlaces: 2,
    unit: NumericUnit.None,
    useThousandSeparator: true,
    prefix: '',
    suffix: ''
  },
  [FieldFormatTypes.Percentage]: {
    decimalPlaces: 2
  },
  [FieldFormatTypes.ScientificNotation]: {
    decimalPlaces: 2
  },
  [FieldFormatTypes.Date]: {
    format: 'YYYY-MM-DD'
  },
  [FieldFormatTypes.Custom]: {
    format: ''
  }
}
