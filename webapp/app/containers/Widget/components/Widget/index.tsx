import * as React from 'react'
import * as classnames from 'classnames'
import Pivot from '../Pivot'
import Chart from '../Chart'
const Icon = require('antd/lib/icon')
import { AggregatorType, DragType, IDataParamConfig } from '../Workbench/Dropbox'
import { IDataParamProperty } from '../Workbench/OperatingPanel'
import { IAxisConfig } from '../Workbench/ConfigSections/AxisSection'
import { ISplitLineConfig } from '../Workbench/ConfigSections/SplitLineSection'
import { IPivotConfig } from '../Workbench/ConfigSections/PivotSection'
import { ILabelConfig } from '..//Workbench/ConfigSections/LabelSection'
import { ISpecConfig } from '../Workbench/ConfigSections/SpecSection'
import { ILegendConfig } from '../Workbench/ConfigSections/LegendSection'
import { IToolboxConfig } from '../Workbench/ConfigSections/ToolboxSection'
const styles = require('../Pivot/Pivot.less')

export type DimetionType = 'row' | 'col'
export type RenderType = 'rerender' | 'clear' | 'refresh' | 'resize'
export type WidgetMode = 'pivot' | 'chart'

export interface IWidgetMetric {
  name: string
  agg: AggregatorType
  chart: IChartInfo
}

export interface IWidgetFilter {
  name: string
  type: DragType
  config: IDataParamConfig
}

export interface IChartStyles {
  pivot?: IPivotConfig
  xAxis?: IAxisConfig
  yAxis?: IAxisConfig
  splitLine?: ISplitLineConfig
  label?: ILabelConfig
  legend?: ILegendConfig
  toolbox?: IToolboxConfig
  spec?: ISpecConfig
}

export interface IChartInfo {
  id: number
  name: string
  title: string
  icon: string
  coordinate: 'cartesian' | 'polar' | 'other'
  requireDimetions: number | number[],
  requireMetrics: number | number[],
  dimetionAxis?: DimetionType
  data: object,
  style: object
}

export interface IWidgetProps {
  data: object[]
  cols: string[]
  rows: string[]
  metrics: IWidgetMetric[]
  filters: IWidgetFilter[]
  chartStyles: IChartStyles
  selectedChart: number
  color?: IDataParamProperty
  label?: IDataParamProperty
  size?: IDataParamProperty
  xAxis?: IDataParamProperty
  tip?: IDataParamProperty
  dimetionAxis?: DimetionType
  renderType?: RenderType
  orders: Array<{column: string, direction: string}>
  queryParams: any[]
  cache: boolean
  expired: number
  mode: WidgetMode
  onCheckTableInteract?: () => boolean
  onDoInteract?: (triggerData: object) => void
}

export interface IWidgetWrapperProps extends IWidgetProps {
  loading: boolean
}

export class Widget extends React.Component<IWidgetWrapperProps, {}> {
  private width = 0
  private height = 0
  private container: HTMLElement = null

  public componentDidMount () {
    this.getContainerSize()
  }

  public componentWillUpdate (nextProps: IWidgetProps) {
    if (nextProps.renderType === 'resize') {
      this.getContainerSize()
    }
  }

  private getContainerSize = () => {
    const { offsetWidth, offsetHeight } = this.container
    this.width = offsetWidth
    this.height = offsetHeight
  }

  public render () {
    const { loading, mode } = this.props
    const combinedProps = {
      width: this.width,
      height: this.height,
      ...this.props
    }
    delete combinedProps.loading

    return (
      <div className={styles.wrapper} ref={(f) => this.container = f}>
        {/* FIXME */}
        {mode === 'chart'
          ? (
            <Chart {...combinedProps} />
          )
          : (
            <Pivot {...combinedProps} />
          )
        }
        <div
          className={classnames({
            [styles.mask]: true,
            [styles.loading]: loading
          })}
        >
          <Icon type="loading" />
          <p>加载中…</p>
        </div>
      </div>
    )
  }
}

export default Widget
