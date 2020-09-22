import React from 'react'

import { IDataParamSource } from './Dropbox'
import { getAggregatorLocale, decodeMetricName } from '../util'
import { PIVOT_DEFAULT_SCATTER_SIZE_TIMES } from 'app/globalConstants'
import { Tabs, Slider } from 'antd'
const TabPane = Tabs.TabPane
const styles = require('./Workbench.less')
const utilStyles = require('assets/less/util.less')

interface ISizePanelProps {
  list: IDataParamSource[]
  value: object
  hasTabs: boolean
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
      size: PIVOT_DEFAULT_SCATTER_SIZE_TIMES,
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
      size: value[key] || PIVOT_DEFAULT_SCATTER_SIZE_TIMES
    })
  }

  private sizeChange = (value) => {
    this.props.onValueChange(this.state.selectedTab, value)
  }

  public render () {
    const { list, hasTabs } = this.props
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
          className={!hasTabs ? utilStyles.hide : ''}
        >
          {tabPanes}
        </Tabs>
        <Slider min={1} max={10} value={size} onChange={this.sizeChange} />
      </div>
    )
  }
}

export default SizePanel
