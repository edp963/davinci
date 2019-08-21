import { FieldSortTypes } from './constants'
import { DragObjectWithType } from 'react-dnd'

export interface IFieldSortConfig {
  sortType: FieldSortTypes
  [FieldSortTypes.Custom]?: {
    sortList: string[]
  }
}

export interface IFieldSortDescriptor {
  name: string
  list: string[]
}

export interface ISortDragItem extends DragObjectWithType {
  value: string
  originalIdx: number
}

export interface ISortCollectedProps {
  isDragging: boolean
}
