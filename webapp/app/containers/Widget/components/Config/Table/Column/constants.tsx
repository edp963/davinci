import OperatorTypes from 'utils/operatorTypes'
import { ITableConditionStyle } from './types'

export enum TableCellStyleTypes {
  Column,
  RowTotal,
  ColumnTotal
}

export enum TableConditionStyleTypes {
  BackgroundColor = 'backgroundColor',
  TextColor = 'textColor',
  NumericBar = 'numericBar',
  Custom = 'custom'
}

export enum TableConditionStyleFieldTypes {
  Column,
  RowTotal,
  ColumnTotal
}

export const AvailableTableConditionStyleTypes = {
  [TableConditionStyleTypes.BackgroundColor]: '背景颜色',
  [TableConditionStyleTypes.TextColor]: '字体颜色',
  [TableConditionStyleTypes.NumericBar]: '条形图',
  [TableConditionStyleTypes.Custom]: '自定义'
}

export const TableConditionStyleTypesSetting = {
  [TableConditionStyleTypes.BackgroundColor]: ['string', 'geoCountry', 'geoProvince', 'geoCity', 'number', 'date'],
  [TableConditionStyleTypes.TextColor]: ['string', 'geoCountry', 'geoProvince', 'geoCity', 'number', 'date'],
  [TableConditionStyleTypes.NumericBar]: ['number'],
  [TableConditionStyleTypes.Custom]: ['string', 'geoCountry', 'geoProvince', 'geoCity', 'number', 'date']
}

export const defaultConditionStyle: ITableConditionStyle = {
  key: '',
  type: TableConditionStyleTypes.BackgroundColor,
  operatorType: OperatorTypes.Equal,
  conditionValues: [],
  colors: {
    background: '#000',
    fore: '#fff',
    positive: '#008fff',
    negative: '#5cc504'
  },
  zeroPosition: 'auto',
  bar: {
    mode: 'auto'
  },
  customTemplate: ''
}
