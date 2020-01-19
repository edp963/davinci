/** To solve the reexport problem, https://github.com/babel/babel/issues/8361 */
import * as Types from './types'
export type IFieldFormatConfig = Types.IFieldFormatConfig

export { FieldFormatTypes, FieldFormatTypesLocale, defaultFormatConfig } from './constants'
export { getDefaultFieldFormatConfig, getFormattedValue } from './util'
export { default as FormatConfigModal } from './FormatConfigModal'
