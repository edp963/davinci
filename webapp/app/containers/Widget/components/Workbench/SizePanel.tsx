import * as React from 'react'
import * as classnames from 'classnames'

import { IDataParamSource } from './Dropbox'
import { getAggregatorLocale, decodeMetricName } from '../util'
const Tabs = require('antd/lib/tabs')
const TabPane = Tabs.TabPane
const Slider = require('antd/lib/slider')
const defaultTheme = require('../../../../assets/json/echartsThemes/default.project.json')
const defaultThemeColors = defaultTheme.theme.color
const styles = require('./Workbench.less')

interface ISizePanelProps {
  list: IDataParamSource[]
  value: object
  onValueChange: (key: string, value: string) => void
}

interface ISizePanelStates {
  size: number
  selectedTab: string
}

export class SizePanel extends React.PureComponent<ISizePanelProps, ISizePanelStates> {
  constructor (props) {
    super(props)
    this.state = {
      size: 3,
      selectedTab: 'all'
    }
  }

  public componentWillMount () {
    this.initSize(this.props.value)
  }

  public componentWillReceiveProps (nextProps) {
    if (nextProps.list !== this.props.list) {
      this.setState({
        selectedTab: 'all',
        size: nextProps.value['all']
      })
    } else {
      this.initSize(nextProps.value)
    }
  }

  private initSize = (value) => {
    this.setState({
      size: value[this.state.selectedTab]
    })
  }

  private tabSelect = (key) => {
    const { value } = this.props
    this.setState({
      selectedTab: key,
      size: value[key] || 3
    })
  }

  private sizeChange = (value) => {
    this.props.onValueChange(this.state.selectedTab, value)
  }

  public render () {
    const { list } = this.props
    const { size, selectedTab } = this.state
    const tabPanes = [(
      <TabPane tab="应用全部" key="all" />
    )].concat(list.map((l) => (
      <TabPane
        tab={`[${getAggregatorLocale(l.agg)}]
        ${decodeMetricName(l.name)}`}
        key={l.name}
      />
    )))
    return (
      <div className={styles.sizePanel}>
        <Tabs
          size="small"
          activeKey={selectedTab}
          onChange={this.tabSelect}
        >
          {tabPanes}
        </Tabs>
        <Slider min={1} max={10} value={size} onChange={this.sizeChange} />
      </div>
    )
  }
}

export default SizePanel
