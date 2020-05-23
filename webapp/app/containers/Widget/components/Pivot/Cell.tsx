import * as React from 'react'
import { IWidgetMetric, IChartStyles } from '../Widget'
import { ILegend } from './Pivot'
import { IDataParamProperty } from '../Workbench/OperatingPanel'
import { DEFAULT_SPLITER } from 'app/globalConstants'
import { decodeMetricName } from 'containers/Widget/components/util'

const styles = require('./Pivot.less')

interface ICellProps {
  colKey?: string
  rowKey?: string
  width: number
  height?: number
  interacting?: boolean
  metrics: IWidgetMetric[]
  chartStyles: IChartStyles
  color: IDataParamProperty
  legend: ILegend
  data: any[]
  ifSelectedTdToDrill: (obj: any) => any
  isDrilling?: boolean
}

interface ICellState {
  isSelected?: boolean
}

export class Cell extends React.PureComponent <ICellProps, ICellState> {
  constructor (props) {
    super(props)
    this.state = {
      isSelected: false
    }
  }
  public componentWillReceiveProps (nextProps) {
    if (nextProps.isDrilling === false) {
      this.setState({
        isSelected: false
      })
    }
    if (this.props.interacting !== nextProps.interacting && !nextProps.interacting) {
      this.setState({isSelected: false})
    }
  }
  private selectTd  = (event) => {
    const pagex = event.pageX
    const pagey = event.pageY
    const {ifSelectedTdToDrill, data, isDrilling, colKey = '', rowKey = ''} = this.props
    this.setState({
      isSelected: !this.state.isSelected
    }, () => {
      const {isSelected} = this.state
      const key = [colKey, rowKey].join(String.fromCharCode(0))
      let obj = null
      if (ifSelectedTdToDrill && isSelected) {
        obj = {
          data: {[key]: data && data.length === 1 ? data[0] : data},
          range: [[pagex, pagex], [pagey, pagey]]
        }
      } else {
        obj = {
          data: {[key]: false}
        }
      }
      ifSelectedTdToDrill(obj)
    })
  }
  public render () {
    const { colKey = '', rowKey = '', width, height, data, chartStyles, color, legend } = this.props
    const { isSelected } = this.state
    const {
      color: fontColor,
      fontSize,
      fontFamily,
      lineColor,
      lineStyle
    } = chartStyles.pivot
    let metrics = this.props.metrics
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
      borderStyle: lineStyle,
      backgroundColor: isSelected ? '#d2eafb' : '#fff'
    }

    return (
      <td style={cellStyles} onClick={this.selectTd}>
        {content}
      </td>
    )
  }
}

export default Cell

function getMetricKey (key) {
  return key.split(String.fromCharCode(0))
    .filter((k) => k.includes(DEFAULT_SPLITER))[0]
}



