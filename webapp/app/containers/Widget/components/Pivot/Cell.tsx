import * as React from 'react'
import { IPivotMetric } from './Pivot'

interface ICellProps {
  width: number
  height?: number
  metrics: IPivotMetric[]
  data: any[]
}

export function Cell (props: ICellProps) {
  const { width, height, metrics, data } = props
  const content = metrics.map((m) => data[0] && data[0][`${m.agg}(${m.name})`]).join('\r\n')

  const cellStyles = {
    width,
    ...(height && { height })
  }

  return (
    <td style={cellStyles}>
      {content}
    </td>
  )
}

export default Cell
