import * as React from 'react'
import * as classnames from 'classnames'
import { IChartInfo } from '../Pivot/Chart'
import { checkChartEnable } from '../util'
const Tooltip = require('antd/lib/tooltip')
const styles = require('./Workbench.less')

interface IChartIndicatorProps extends IChartInfo {
  dimetionsCount: number
  metricsCount: number
  selected: number
  onSelect: (chartId: number) => void
}

export class ChartIndicator extends React.PureComponent<IChartIndicatorProps, {}> {
  private onSelect = () => {
    const { id, onSelect, dimetionsCount, metricsCount, requireDimetions, requireMetrics } = this.props
    if (checkChartEnable(dimetionsCount, metricsCount, requireDimetions, requireMetrics)) {
      onSelect(id)
    }
  }

  public render () {
    const { id, name, icon, dimetionsCount, metricsCount, requireDimetions, requireMetrics, selected } = this.props

    const title = (
      <p>
        {name}<br />
        {Array.isArray(requireDimetions)
          ? `需要 ${requireDimetions[0]}个 到 ${requireDimetions[2] === 9999 ? '多' : requireDimetions[2]}个 维度`
          : `需要 ${requireDimetions}个 维度`}<br/>
        {Array.isArray(requireMetrics)
          ? `需要 ${requireMetrics.map((m) => `${m === 9999 ? '多' : m}个`).join(` 到 `)} 度量`
          : `需要 ${requireMetrics}个 度量`}
      </p>
    )

    const iconClass = classnames({
      iconfont: true,
      [icon]: true,
      [styles.enabled]: checkChartEnable(dimetionsCount, metricsCount, requireDimetions, requireMetrics),
      [styles.selected]: selected === id
    })
    return (
      <Tooltip
        title={title}
        placement="bottom"
        mouseLeaveDelay={0}
      >
        <i className={iconClass} onClick={this.onSelect} />
      </Tooltip>
    )
  }
}

export default ChartIndicator
