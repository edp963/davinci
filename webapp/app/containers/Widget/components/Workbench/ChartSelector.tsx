import * as React from 'react'
import widgetlibs from '../../../../assets/json/widgetlib'
const Dropdown = require('antd/lib/dropdown')
const Menu = require('antd/lib/menu')
const MenuItem = Menu.Item
import { checkChartEnable, getPivot } from '../util'
import { IChartInfo } from '../Pivot/Chart'
const styles = require('./Workbench.less')

interface IChartSelectorProps {
  chart: IChartInfo
  dimetionsCount: number
  metricsCount: number
  onChangeChart: (chart: IChartInfo) => void
}

export function ChartSelector (props: IChartSelectorProps) {
  const pivot = getPivot()
  const enabledChartList = widgetlibs
    .filter((w) => w !== pivot && checkChartEnable(props.dimetionsCount, props.metricsCount, w))
    .map((c) => (
      <MenuItem key={c.id} className={styles.item}>
        <i className={`iconfont ${c.icon} ${styles.icon}`} />
      </MenuItem>
    ))
  const selector = props.chart === pivot
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

export default ChartSelector

function chartClick (props: IChartSelectorProps) {
  return function ({key}) {
    const selectedChart = widgetlibs.find((wl) => `${wl.id}` === key)
    const originalChart = props.chart
    if (selectedChart.id !== originalChart.id) {
      props.onChangeChart(selectedChart)
    }
  }
}
