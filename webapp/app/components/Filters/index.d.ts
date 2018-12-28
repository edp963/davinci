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
  fromParent?: string
  fromChild?: string
  operator: OperatorTypes
  relatedViews: {
    [viewId: string]: IFilterViewConfig
  }
}

export interface IFilterValue {
  params: Array<{ name: string, value: string | number }>
  filters: string[]
}

export interface IMapItemFilterValue {
  [itemId: number]: IFilterValue
}

export type OnGetFilterControlOptions = (
  controlKey: string,
  viewId: string,
  columns: string[],
  parents: Array<{ column: string, value: string }>
) => void

export type FilterControlOptions = Array<{
  [key: string]: Array<number | string>
}>

export type MapFilterControlOptions = {
  [controlKey: string]: FilterControlOptions
}

export type OnFilterControlValueChange = (
  filterItem: IFilterItem,
  value: number | string
) => void

export type OnFilterValueChange = (
  mapItemFilterValue: IMapItemFilterValue,
  filterKey: string
) => void
