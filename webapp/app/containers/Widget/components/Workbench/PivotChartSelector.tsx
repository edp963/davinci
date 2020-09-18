import React from 'react'
import widgetlibs from '../../config'
const pivotlibs = widgetlibs['pivot']
import { Dropdown, Menu } from 'antd'
const MenuItem = Menu.Item
import { checkChartEnable, getPivot } from '../util'
import { IChartInfo } from '../Widget'
const styles = require('./Workbench.less')

interface IPivotChartSelectorProps {
  chart: IChartInfo
  dimetionsCount: number
  metricsCount: number
  onChangeChart: (chart: IChartInfo) => void
}

export function PivotChartSelector (props: IPivotChartSelectorProps) {
  const pivot = getPivot()
  const enabledChartList = pivotlibs
    .filter((w) => w !== pivot && checkChartEnable(props.dimetionsCount, props.metricsCount, w))
    .map((c) => (
      <MenuItem key={c.id} className={styles.item}>
        <i className={`iconfont ${c.icon} ${styles.icon}`} />
      </MenuItem>
    ))
  const selector = props.chart.id === pivot.id
    ? null
    : (
      <Dropdown
        overlay={(
          <Menu className={styles.chartSelectorList} onClick={chartClick(props)}>
            {enabledChartList}
          </Menu>
        )}
        trigger={['click']}
      >
        <i className={`iconfont ${props.chart.icon} ${styles.chart}`} />
      </Dropdown>
    )
  return selector
}

export default PivotChartSelector

function chartClick (props: IPivotChartSelectorProps) {
  return function ({key}) {
    const selectedChart = pivotlibs.find((wl) => `${wl.id}` === key)
    const originalChart = props.chart
    if (selectedChart.id !== originalChart.id) {
      props.onChangeChart(selectedChart)
    }
  }
}
