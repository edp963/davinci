import * as React from 'react'
import { IPivotMetric, ILegend } from './Pivot'
import { IDataParamProperty } from '../Workbench/OperatingPanel'

interface ICellProps {
  width: number
  height?: number
  metrics: IPivotMetric[]
  color: IDataParamProperty
  legend: ILegend
  data: any[]
}

export function Cell (props: ICellProps) {
  const { width, height, metrics, data, color, legend } = props
  const content = metrics.map((m) => {
    const currentColorItem = color.items.find((i) => i.config.actOn === m.name) || color.items.find((i) => i.config.actOn === 'all')
    return data && data.map((d, index) => {
      let styleColor
      if (currentColorItem) {
        const legendSelectedItem = legend[currentColorItem.name]
        if (!(legendSelectedItem && legendSelectedItem.includes(d[currentColorItem.name]))) {
          styleColor = {
            color: currentColorItem.config.values[d[currentColorItem.name]]
          }
        }
      }
      return (
        <p
          key={`${m.name}${index}`}
          style={{...styleColor}}
        >
          {d[`${m.agg}(${m.name})`]}
        </p>
      )
    })
  })

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
