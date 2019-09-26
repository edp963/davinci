import React, { useCallback } from 'react'
import produce from 'immer'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import { Icon, Tooltip } from 'antd'

import { StackGroup, IStackMetrics } from './types'
import MetricItem from './MetricItem'
import StackItem from './StackItem'

import Styles from './Stack.less'

interface IStackContainerProps {
  metrics: IStackMetrics
  group: StackGroup
  onStackGroupChange: (stack: StackGroup) => void
}

const findMetricLocation = (metricId: string, stack: string[][]) => {
  let location = null
  stack.some((group, grpIdx) => {
    const metricIdx = group.indexOf(metricId)
    if (metricIdx >= 0) {
      location = [grpIdx, metricIdx]
      return true
    }
  })
  return location
}

const StackContainer: React.FC<IStackContainerProps> = (props) => {
  const { group: stack, metrics, onStackGroupChange } = props

  const removeMetric = useCallback(
    (item) => {
      const { id } = item
      const nextStack = produce(stack, (draft) => {
        const prevLoc = findMetricLocation(id, stack)
        if (prevLoc) {
          draft[prevLoc[0]].splice(prevLoc[1], 1)
          if (!draft[prevLoc[0]].length) {
            draft.splice(prevLoc[0], 1)
          }
        }
      })
      onStackGroupChange(nextStack)
    },
    [stack]
  )

  const flatStack = stack.reduce((acc, stackItem) => acc.concat(stackItem), [])
  const metricList = (
    <StackItem className={Styles.list} onDrop={removeMetric}>
      {Object.entries(metrics)
        .filter(([id]) => !flatStack.includes(id))
        .map(([id, name]) => (
          <MetricItem key={id} id={id} name={name} />
        ))}
    </StackItem>
  )

  const handleDrop = useCallback(
    (grpIdx: number) => (item) => {
      const { id } = item
      const nextStack = produce(stack, (draft) => {
        const prevLoc = findMetricLocation(id, stack)
        if (prevLoc) {
          draft[prevLoc[0]].splice(prevLoc[1], 1)
        }
        draft[grpIdx].push(id)
      })
      onStackGroupChange(nextStack)
    },
    [stack]
  )

  const stackGroups = stack.map((group, grpIdx) => (
    <StackItem
      key={grpIdx}
      className={Styles.stackItem}
      onDrop={handleDrop(grpIdx)}
    >
      {group.map((id) => (
        <MetricItem key={id} id={id} name={metrics[id]} />
      ))}
    </StackItem>
  ))

  const addStackGroup = useCallback(
    () => {
      const nextStack = produce(stack, (draft) => {
        draft.push([])
      })
      onStackGroupChange(nextStack)
    },
    [stack]
  )

  return (
    <DndProvider backend={HTML5Backend}>
      {metricList}
      <div className={Styles.groups}>
        {stackGroups}
        <div className={`${Styles.stackItem} ${Styles.add}`}>
          <Tooltip title="点击添加堆叠分组">
            <Icon onClick={addStackGroup} type="plus" />
          </Tooltip>
        </div>
      </div>
    </DndProvider>
  )
}

export default StackContainer
