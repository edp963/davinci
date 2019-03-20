import * as React from 'react'
import * as classnames from 'classnames'
import { IChartInfo } from '../Widget'
import { checkChartEnable } from '../util'
import { Tooltip } from 'antd'
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

  let dimetionContent
  let metricContent

  if (Array.isArray(requireDimetions)) {
    dimetionContent = `需要 ${requireDimetions[0]}个 到 ${requireDimetions[1] === 9999 ? '多' : requireDimetions[1]}个 维度`
  } else {
    dimetionContent =  `需要 ${requireDimetions}个 维度`
  }

  if (Array.isArray(requireMetrics)) {
    metricContent = `需要 ${requireMetrics[0]}个 到 ${requireMetrics[1] === 9999 ? '多' : requireMetrics[1]}个 指标`
  } else {
    metricContent =  `需要 ${requireMetrics}个 指标`
  }

  const overlay = (
    <p>
      {title}<br />
      {dimetionContent}<br/>
      {metricContent}
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
