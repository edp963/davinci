import React from 'react'
import classnames from 'classnames'
import { IDataParamProperty } from '../Workbench/OperatingPanel'
import { IDataParamSource } from '../Workbench/Dropbox'
import { IChartStyles } from 'containers/Widget/components/Widget'
import { getStyleConfig } from 'containers/Widget/components/util'

const styles = require('./Pivot.less')

interface ILegendProps {
  color: IDataParamProperty
  chartStyles: IChartStyles
  onLegendSelect: (name: string, key: string) => void
}

interface ILengdItem extends IDataParamSource {
  localConfig?: {
    values?: {
      [key: string]: {
        value: string
        visible: boolean
      }
    }
  }
}

interface ILegendStates {
  list: ILengdItem[]
}

export class Legend extends React.PureComponent<ILegendProps, ILegendStates> {
  constructor (props) {
    super(props)
    this.state = {
      list: []
    }
  }

  public componentWillMount () {
    this.initList(this.props)
  }

  public componentWillReceiveProps (nextProps) {
    this.initList(nextProps)
  }

  private initList = (props) => {
    const { color } = props
    const { list } = this.state
    if (color && color.items.length) {
      this.setState({
        list: color.items.map((item) => {
          const originItem = list.find((i) => i.name === item.name)
          const originConfig = originItem && originItem.localConfig
          const configValues = Object.entries(item.config.values).reduce((obj, [key, value]) => {
            obj[key] = {
              value,
              visible: originConfig ? originConfig.values[key].visible : true
            }
            return obj
          }, {})
          return {
            ...item,
            localConfig: {
              values: configValues
            }
          }
        })
      })
    } else {
      this.setState({
        list: []
      })
    }
  }

  private legendSelect = (name: string, key: string) => () => {
    const { list } = this.state
    const selectedItem = list.find((i) => i.name === name)
    const visible = selectedItem.localConfig.values[key].visible
    selectedItem.localConfig.values[key].visible = !visible
    this.setState({list})
    this.props.onLegendSelect(name, key)
  }

  public render () {
    const { chartStyles } = this.props
    const { list } = this.state
    const { color: fontColor } = getStyleConfig(chartStyles).pivot
    const legendClass = classnames({
      [styles.legend]: true,
      [styles.shown]: list.length
    })

    const legendBoxes = list.map((i) => {
      const { values } = i.localConfig
      const listItems = Object.entries(values).map(([key, value]: [string, { value: string, visible: boolean }]) => {
        return  (
          <li
            key={key}
            onClick={this.legendSelect(i.name, key)}
            className={classnames({[styles.disabled]: !value.visible})}
            style={{
              color: fontColor
            }}
          >
            <span style={{background: value.value}} />
            {key}
          </li>
        )
      })
      return (
        <div key={i.name} className={styles.legendBox}>
          <h4
            style={{
              color: fontColor
            }}
          >
            {i.name}
          </h4>
          <ul className={styles.list}>
            {listItems}
          </ul>
        </div>
      )
    })

    return (
      <div className={legendClass}>
        {legendBoxes}
      </div>
    )
  }
}

export default Legend
