import * as React from 'react'
import * as classnames from 'classnames'
import { SketchPicker } from 'react-color'
import { IDataParamSource } from './Dropbox'
import { getAggregatorLocale, decodeMetricName } from '../util'
const defaultTheme = require('assets/json/echartsThemes/default.project.json')
const defaultThemeColors = defaultTheme.theme.color
const styles = require('./Workbench.less')
const utilStyles = require('assets/less/util.less')

interface IColorPanelProps {
  list: IDataParamSource[]
  value: object
  showAll: boolean
  onValueChange: (key: string, value: string) => void
}

interface IColorPanelStates {
  color: string
  selectedTab: string
}

export class ColorPanel extends React.PureComponent<IColorPanelProps, IColorPanelStates> {
  constructor (props) {
    super(props)
    this.state = {
      color: defaultThemeColors[0],
      selectedTab: 'all'
    }
  }

  public componentWillMount () {
    this.initColor(this.props.value)
  }

  public componentWillReceiveProps (nextProps) {
    if (nextProps.list !== this.props.list) {
      this.setState({
        selectedTab: 'all',
        color: nextProps.value['all']
      })
    } else {
      this.initColor(nextProps.value)
    }
  }

  private initColor = (value) => {
    this.setState({
      color: value[this.state.selectedTab]
    })
  }

  private tabSelect = (key) => () => {
    const { value } = this.props
    this.setState({
      selectedTab: key,
      color: value[key] || defaultThemeColors[0]
    })
  }

  private colorChange = ({hex}) => {
    this.props.onValueChange(this.state.selectedTab, hex)
  }

  public render () {
    const { list, showAll } = this.props
    const { color, selectedTab } = this.state

    const allTabClass = classnames({
      [styles.selected]: selectedTab === 'all',
      [utilStyles.hide]: !showAll
    })

    const tabs = [(
      <li
        className={allTabClass}
        key="all"
        onClick={this.tabSelect('all')}
      >
        应用全部
      </li>
    )].concat(list.map((l) => (
      <li
        className={classnames({ [styles.selected]: selectedTab === l.name })}
        key={l.name}
        onClick={this.tabSelect(l.name)}
      >
        {`[${getAggregatorLocale(l.agg)}] ${decodeMetricName(l.name)}`}
      </li>
    )))

    return (
      <div className={styles.colorPanel}>
        <ul className={styles.tabs}>
          {tabs}
        </ul>
        <div className={styles.picker}>
          <SketchPicker
            className="sketchpickerinpanel"
            color={color}
            presetColors={defaultThemeColors}
            onChangeComplete={this.colorChange}
            disableAlpha
          />
        </div>
      </div>
    )
  }
}

export default ColorPanel
