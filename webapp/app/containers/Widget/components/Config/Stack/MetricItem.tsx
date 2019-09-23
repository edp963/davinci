import React from 'react'
import { useDrag } from 'react-dnd'
import { StackItemType } from './constants'

import Styles from './Stack.less'

interface IMetricItemProps {
  id: string
  name: string
}

const MetricItem: React.FC<IMetricItemProps> = (props) => {
  const { id, name } = props

  const [{ isDragging }, drag] = useDrag({
    item: { type: StackItemType, id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  })

  return (
    <div
      ref={drag}
      className={Styles.metricItem}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <span>{name}</span>
    </div>
  )
}

export default MetricItem
