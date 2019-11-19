import moment from 'moment'
import { IFieldFormatConfig } from './types'
import { NumericUnit, FieldFormatTypes } from './constants'

export function getDefaultFieldFormatConfig (): IFieldFormatConfig {
  return {
    formatType: FieldFormatTypes.Default
  }
}

export function getFormattedValue (value: number | string, format: IFieldFormatConfig) {
  if (!format || format.formatType === FieldFormatTypes.Default) { return value }
  if (value === null || value === undefined) { return value }

  const { formatType } = format
  if (typeof value === 'string' && formatType !== FieldFormatTypes.Date && (!value || isNaN(+value))) { return value }

  const config = format[formatType]
  let formattedValue

  switch (formatType) {
    case FieldFormatTypes.Numeric:
    case FieldFormatTypes.Currency:
      const {
        decimalPlaces,
        unit,
        useThousandSeparator } = config as IFieldFormatConfig['numeric'] | IFieldFormatConfig['currency']
      formattedValue = formatByUnit(value, unit)
      formattedValue = formatByDecimalPlaces(formattedValue, decimalPlaces)
      formattedValue = formatByThousandSeperator(formattedValue, useThousandSeparator)
      if (unit !== NumericUnit.None) {
        formattedValue = `${formattedValue}${unit}`
      }
      if (formatType === FieldFormatTypes.Currency) {
        const { prefix, suffix } = config as IFieldFormatConfig['currency']
        formattedValue = [prefix, formattedValue, suffix].join('')
      }
      break
    case FieldFormatTypes.Percentage:
      formattedValue = (+value) * 100
      formattedValue = isNaN(formattedValue) ? value
        : `${formatByDecimalPlaces(formattedValue, (config as IFieldFormatConfig['percentage']).decimalPlaces)}%`
      break
    case FieldFormatTypes.ScientificNotation:
      formattedValue = (+value).toExponential((config as IFieldFormatConfig['scientificNotation']).decimalPlaces)
      formattedValue = isNaN(formattedValue) ? value : formattedValue
      break
    case FieldFormatTypes.Date:
      const { format } = config as IFieldFormatConfig['date']
      formattedValue = moment(value).format(format)
      break
    case FieldFormatTypes.Custom:
      // @TODO
      break
    default:
      formattedValue = value
      break
  }

  return formattedValue
}

function formatByDecimalPlaces (value, decimalPlaces: number) {
  if (isNaN(value)) { return value }
  if (decimalPlaces < 0 || decimalPlaces > 100) { return value }

  return (+value).toFixed(decimalPlaces)
}

function formatByThousandSeperator (value, useThousandSeparator: boolean) {
  if (isNaN(+value) || !useThousandSeparator) { return value }

  const parts = value.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const formatted = parts.join('.')
  return formatted
}

function formatByUnit (value, unit: NumericUnit) {
  const numericValue = +value
  if (isNaN(numericValue)) { return value }

  let exponent = 0
  switch (unit) {
    case NumericUnit.TenThousand:
      exponent = 4
      break
    case NumericUnit.OneHundredMillion:
      exponent = 8
      break
    case NumericUnit.Thousand:
      exponent = 3
      break
    case NumericUnit.Million:
      exponent = 6
      break
    case NumericUnit.Giga:
      exponent = 9
      break
  }
  return numericValue / Math.pow(10, exponent)
}
