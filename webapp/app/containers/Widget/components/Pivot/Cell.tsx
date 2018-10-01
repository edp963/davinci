import * as React from 'react'
import { IWidgetMetric, IChartStyles } from '../Widget'
import { ILegend } from './Pivot'
import { IDataParamProperty } from '../Workbench/OperatingPanel'
import { DEFAULT_SPLITER } from '../../../../globalConstants'
import { decodeMetricName } from 'containers/Widget/components/util'

const styles = require('./Pivot.less')

interface ICellProps {
  colKey?: string
  rowKey?: string
  width: number
  height?: number
  metrics: IWidgetMetric[]
  chartStyles: IChartStyles
  color: IDataParamProperty
  legend: ILegend
  data: any[]
}

export function Cell (props: ICellProps) {
  const { colKey = '', rowKey = '', width, height, data, chartStyles, color, legend } = props
  const {
    color: fontColor,
    fontSize,
    fontFamily,
    lineColor,
    lineStyle
  } = chartStyles.pivot

  let metrics = props.metrics

  if (colKey.includes(DEFAULT_SPLITER) && rowKey.includes(DEFAULT_SPLITER)) {
    const metricColKey = getMetricKey(colKey)
    const metricRowKey = getMetricKey(rowKey)
    if (metricColKey === metricRowKey) {
      const [name, id] = metricColKey.split(DEFAULT_SPLITER)
      metrics = metrics.filter((m) => m.name === `${name}${DEFAULT_SPLITER}${id}`)
    } else {
      metrics = []
    }
  } else if (colKey.includes(DEFAULT_SPLITER)) {
    const [name, id] = getMetricKey(colKey).split(DEFAULT_SPLITER)
    metrics = metrics.filter((m) => m.name === `${name}${DEFAULT_SPLITER}${id}`)
  } else if (rowKey.includes(DEFAULT_SPLITER)) {
    const [name, id] = getMetricKey(rowKey).split(DEFAULT_SPLITER)
    metrics = metrics.filter((m) => m.name === `${name}${DEFAULT_SPLITER}${id}`)
  }

  const content = metrics.map((m) => {
    const decodedMetricName = decodeMetricName(m.name)
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
          className={styles.cellContent}
          style={{...styleColor}}
        >
          {d[`${m.agg}(${decodedMetricName})`]}
        </p>
      )
    })
  })

  const cellStyles = {
    width,
    ...(height && { height }),
    color: fontColor,
    fontSize: Number(fontSize),
    fontFamily,
    borderColor: lineColor,
    borderStyle: lineStyle
  }

  return (
    <td style={cellStyles}>
      {content}
    </td>
  )
}

export default Cell

function getMetricKey (key) {
  return key.split(String.fromCharCode(0))
    .filter((k) => k.includes(DEFAULT_SPLITER))[0]
}
