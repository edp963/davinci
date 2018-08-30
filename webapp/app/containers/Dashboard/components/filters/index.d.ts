import { FilterTypes } from './filterTypes'

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
  relatedViews: {
    [viewId: string]: IFilterViewConfig
  }
}
