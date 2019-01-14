import React, { createRef } from 'react'
import classnames from 'classnames'
import Pivot from '../Pivot'
import Chart from '../Chart'
import Icon from 'antd/lib/icon'
import { AggregatorType, DragType, IDataParamConfig } from '../Workbench/Dropbox'
import { IDataParamProperty } from '../Workbench/OperatingPanel'
import { IFieldFormatConfig } from '../Workbench/FormatConfigModal'
import { IFieldConfig } from '../Workbench/FieldConfig'
import { IAxisConfig } from '../Workbench/ConfigSections/AxisSection'
import { ISplitLineConfig } from '../Workbench/ConfigSections/SplitLineSection'
import { IPivotConfig } from '../Workbench/ConfigSections/PivotSection'
import { ILabelConfig } from '..//Workbench/ConfigSections/LabelSection'
import { ISpecConfig } from '../Workbench/ConfigSections/SpecSection'
import { ILegendConfig } from '../Workbench/ConfigSections/LegendSection'
import { IVisualMapConfig } from '../Workbench/ConfigSections/VisualMapSection'
import { IToolboxConfig } from '../Workbench/ConfigSections/ToolboxSection'
import { IAreaSelectConfig } from '../Workbench/ConfigSections/AreaSelectSection'
import { IScorecardConfig } from '../Workbench/ConfigSections/ScorecardSection'
import { IframeConfig } from '../Workbench/ConfigSections/IframeSection'
import { ITableConfig } from '../Workbench/ConfigSections/TableSection'
import { IModel } from '../Workbench/index'
const styles = require('../Pivot/Pivot.less')

export type DimetionType = 'row' | 'col'
export type RenderType = 'rerender' | 'clear' | 'refresh' | 'resize' | 'loading'
export type WidgetMode = 'pivot' | 'chart'

export interface IWidgetDimension {
  name: string
  field: IFieldConfig
  format: IFieldFormatConfig
}

export interface IWidgetMetric {
  name: string
  agg: AggregatorType
  chart: IChartInfo
  field: IFieldConfig
  format: IFieldFormatConfig
}

export interface IWidgetSecondaryMetric {
  name: string
  agg: AggregatorType
  field: IFieldConfig
  format: IFieldFormatConfig
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
  axis?: IAxisConfig
  splitLine?: ISplitLineConfig
  label?: ILabelConfig
  legend?: ILegendConfig
  toolbox?: IToolboxConfig
  areaSelect?: IAreaSelectConfig
  spec?: ISpecConfig
  visualMap?: IVisualMapConfig
  scorecard?: IScorecardConfig
  iframe?: IframeConfig
  table?: ITableConfig
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

export interface IPaginationParams {
  pageNo: number
  pageSize: number
  totalCount: number
  withPaging: boolean
}

export interface IWidgetProps {
  data: object[]
  queryVars?: { [key: string]: number | string }
  cols: IWidgetDimension[]
  rows: IWidgetDimension[]
  metrics: IWidgetMetric[]
  secondaryMetrics?: IWidgetSecondaryMetric[]
  filters: IWidgetFilter[]
  chartStyles: IChartStyles
  selectedChart: number
  color?: IDataParamProperty
  label?: IDataParamProperty
  size?: IDataParamProperty
  xAxis?: IDataParamProperty
  tip?: IDataParamProperty
  yAxis?: IDataParamProperty
  dimetionAxis?: DimetionType
  renderType?: RenderType
  orders: Array<{column: string, direction: string}>
  mode: WidgetMode
  model: IModel
  pagination?: IPaginationParams
  onCheckTableInteract?: () => boolean
  onDoInteract?: (triggerData: object) => void
  getDataDrillDetail?: (position: string) => void
  onPaginationChange?: (pageNo: number, pageSize: number) => void
  isDrilling?: boolean
  whichDataDrillBrushed?: boolean | object []
  // onHideDrillPanel?: (swtich: boolean) => void
}

export interface IWidgetConfig extends IWidgetProps {
  queryParams: any[]
  cache: boolean
  expired: number
}

export interface IWidgetWrapperProps extends IWidgetProps {
  loading: boolean
}

export class Widget extends React.Component<IWidgetWrapperProps, {}> {
  private width = 0
  private height = 0
  private container = createRef<HTMLDivElement>()

  public componentDidMount () {
    this.getContainerSize()
  }

  public componentWillUpdate (nextProps: IWidgetProps) {
    if (nextProps.renderType === 'resize') {
      this.getContainerSize()
    }
  }

  private getContainerSize = () => {
    const { offsetWidth, offsetHeight } = this.container.current as HTMLDivElement
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
      <div className={styles.wrapper} ref={this.container}>
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
