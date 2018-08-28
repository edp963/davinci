import * as React from 'react'
import * as classnames from 'classnames'
import { IChartInfo } from '../Pivot/Chart'
import { checkChartEnable } from '../util'
const Tooltip = require('antd/lib/tooltip')
const styles = require('./Workbench.less')

interface IChartIndicatorProps {
  chartInfo: IChartInfo
  dimetionsCount: number
  metricsCount: number
  selectedCharts: IChartInfo[]
  onSelect: (chart: IChartInfo) => void
}

export function ChartIndicator (props: IChartIndicatorProps) {
  const { chartInfo, dimetionsCount, metricsCount, selectedCharts } = props
  const { title, icon, requireDimetions, requireMetrics} = chartInfo

  const overlay = (
    <p>
      {title}<br />
      {`需要 ${requireDimetions}个 到多个维度`}<br/>
      {`需要 ${requireMetrics}个 到多个度量`}
    </p>
  )

  const iconClass = classnames({
    iconfont: true,
    [icon]: true,
    [styles.enabled]: checkChartEnable(dimetionsCount, metricsCount, chartInfo),
    [styles.selected]: selectedCharts.filter((s) => s.id !== chartInfo.id).length === 0,
    [styles.multipleSelect]: selectedCharts.some((s) => s.id === chartInfo.id)
  })
  return (
    <Tooltip
      title={overlay}
      placement="bottom"
      mouseLeaveDelay={0}
    >
      <i className={iconClass} onClick={onSelect(props)} />
    </Tooltip>
  )
}

function onSelect (props) {
  return function () {
    const { chartInfo, onSelect, dimetionsCount, metricsCount } = props
    if (checkChartEnable(dimetionsCount, metricsCount, chartInfo)) {
      onSelect(chartInfo)
    }
  }
}

export default ChartIndicator
