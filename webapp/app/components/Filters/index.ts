import { uuid } from 'utils/util'
import { FilterTypes, FilterTypesOperatorSetting } from './filterTypes'
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
  fromView?: string
  fromText?: string
  fromModel?: string
  fromParent?: string
  fromChild?: string
  operator: OperatorTypes
  relatedViews: {
    [viewId: string]: IFilterViewConfig
  },
  children?: IFilterItem[]
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

export interface IMapFilterControlOptions {
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

export function getDefaultFilterItem (): IFilterItem {
  const filterItem: IFilterItem = {
    key: uuid(8, 16),
    name: '新建全局筛选',
    type: FilterTypes.InputText,
    operator: FilterTypesOperatorSetting[FilterTypes.InputText][0],
    relatedViews: {}
  }
  return filterItem
}

export const traverseFilters = (
  filters: IFilterItem[],
  key: string,
  cb: (filter: IFilterItem, idx: number, subFilters: IFilterItem[]) => void
) => {
  if (!Array.isArray(filters)) { return }

  filters.forEach((filter, idx, arr) => {
    if (filter.key === key) {
      return cb(filter, idx, arr)
    }
    if (filter.children) {
      return traverseFilters(filter.children, key, cb)
    }
  })
}
