import { ITableHeaderConfig } from './Header/types'
import { ITableColumnConfig } from './Column/types'

export interface ITableCellStyle {
  fontSize: string
  fontFamily: string
  fontWeight: string
  fontColor: string
  fontStyle: 'normal' | 'oblique'
  backgroundColor: string
  justifyContent: 'flex-start' | 'center' | 'flex-end'
  inflexible: boolean
  width: number
}

export interface ITableConfig {
  headerConfig: ITableHeaderConfig[]
  columnsConfig: ITableColumnConfig[]
  leftFixedColumns: string[]
  rightFixedColumns: string[]
  headerFixed: boolean
  bordered: boolean
  size: 'default' | 'middle' | 'small'
  autoMergeCell: boolean
  withPaging: boolean
  pageSize: string
  withNoAggregators: boolean
}
