import React from 'react'
import classnames from 'classnames'

import { useDrop } from 'react-dnd'
import { StackItemType } from './constants'

import Styles from './Stack.less'

interface IStackItemProps {
  onDrop: (item: any) => void
  className: string
}

const StackItem: React.FC<IStackItemProps> = (props) => {
  const { className, onDrop, children } = props

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: StackItemType,
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })

  const stackItemCls = classnames({
    [className]: true,
    [Styles.drop]: canDrop && !isOver,
    [Styles.active]: canDrop && isOver
  })

  return (
    <div ref={drop} className={stackItemCls}>{children}</div>
  )
}

export default StackItem
