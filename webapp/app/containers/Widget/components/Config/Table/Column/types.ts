import { ViewModelVisualTypes } from 'containers/View/constants'
import { TableConditionStyleTypes, TableCellStyleTypes } from './constants'
import OperatorTypes from 'utils/operatorTypes'
import { ITableCellStyle } from '../types'

export interface ITableConditionStyle {
  key: string
  type: TableConditionStyleTypes,
  operatorType: OperatorTypes
  conditionValues: Array<string | number>
  colors: {
    background?: string
    fore: string
    positive?: string
    negative?: string
  },
  bar: {
    mode: 'auto' | 'fixed',
    min?: number,
    max?: number
  },
  zeroPosition?: 'auto' | 'center'
  customTemplate?: string
}

export interface ITableColumnConfig {
  columnName: string
  alias: string
  sort?: boolean
  visualType: ViewModelVisualTypes
  styleType: TableCellStyleTypes
  style: ITableCellStyle
  conditionStyles: ITableConditionStyle[]
}
