
import { FieldFormatTypes, NumericUnit } from './constants'

export interface IFieldFormatConfig {
  formatType: FieldFormatTypes
  [FieldFormatTypes.Numeric]?: {
    decimalPlaces: number
    unit: NumericUnit
    useThousandSeparator: boolean
  }
  [FieldFormatTypes.Currency]?: {
    decimalPlaces: number
    unit: NumericUnit
    useThousandSeparator: boolean
    prefix: string
    suffix: string
  }
  [FieldFormatTypes.Percentage]?: {
    decimalPlaces: number
  }
  [FieldFormatTypes.ScientificNotation]?: {
    decimalPlaces: number
  }
  [FieldFormatTypes.Date]?: {
    format: string
  }
  [FieldFormatTypes.Custom]?: {
    format: string
  }
}
