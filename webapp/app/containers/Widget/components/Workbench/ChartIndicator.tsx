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
  const { title, icon, rules } = chartInfo

  const contents = rules.map(({ dimension, metric }, ruleIdx) => {
    const subContents = []
    if (Array.isArray(dimension)) {
      subContents.push(`${dimension[0]}个 到 ${dimension[1] === 9999 ? '多' : dimension[1]}个 维度`)
    } else {
      subContents.push(`${dimension}个 维度`)
    }
    if (Array.isArray(metric)) {
      subContents.push(`${metric[0]}个 到 ${metric[1] === 9999 ? '多' : metric[1]}个 指标`)
    } else {
      subContents.push(`${metric}个 指标`)
    }
    if (rules.length > 1) {
      return (<p key={ruleIdx}>{subContents.join('，')}</p>)
    }
    return (subContents.map((item, idx) => (<p key={`${ruleIdx}_${idx}`}>{item}</p>)))
  })

  const overlay = (
    <>
      <p>{title}</p>
      {contents}
    </>
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
