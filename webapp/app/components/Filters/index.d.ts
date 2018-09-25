import { FilterTypes } from './filterTypes'
import { OperatorTypes } from 'utils/operatorTypes'

export interface IModelItem {
  sqlType: string
  visualType: string
  modelType: 'value' | 'category'
}

export interface IModel {
  [itemName: string]: IModelItem
}

export interface IFilterViewConfig {
  key: number
  name: string
  isParam: boolean
  sqlType: string
  items: number[]
}

export interface IFilterItem {
  key: string
  name: string
  type: FilterTypes
  fromView: string
  fromModel: string
  operator: OperatorTypes
  relatedViews: {
    [viewId: string]: IFilterViewConfig
  }
}

export interface IFilterValue {
  params: Array<{ name: string, value: string | number }>
  filters: string[]
}

export interface IFilterChangeParam {
  [itemId: number]: IFilterValue
}
