import React from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { SortItemType } from './constants'

import { Icon } from 'antd'

import { ISortDragItem, ISortCollectedProps } from './types'
import Styles from './Sort.less'

interface ISortItemProps {
  value: string
  onSort: (draggedValue: string, nextIdx: number) => void
  onFindIndex: (value: string) => number
}

const SortItem = (props: ISortItemProps) => {
  const { value, onSort, onFindIndex } = props
  const originalIdx = onFindIndex(value)

  const [{ isDragging }, drag] = useDrag<
    ISortDragItem,
    {},
    ISortCollectedProps
  >({
    item: { type: SortItemType, value, originalIdx },
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  })

  const [, drop] = useDrop<ISortDragItem, {}, ISortCollectedProps>({
    accept: SortItemType,
    canDrop: () => false,
    hover ({ value: draggedValue }) {
      if (draggedValue === value) {
        return
      }
      const nextIdx = onFindIndex(value)
      onSort(draggedValue, nextIdx)
    }
  })

  const dragRef = (node) => drag(drop(node))
  const opacity = isDragging ? 0 : 1

  return (
    <div ref={dragRef} className={Styles.sortItem} style={{opacity}}>
      <Icon className={Styles.sortIcon} type="more" />
      <span>{value}</span>
    </div>
  )
}

export default SortItem
