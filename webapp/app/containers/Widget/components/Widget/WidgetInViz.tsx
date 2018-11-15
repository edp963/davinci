import * as React from 'react'
import Widget, { IWidgetWrapperProps } from './index'
import { getStyleConfig } from '../util'
import ChartTypes from '../../config/chart/ChartTypes'
interface IWidgetInVizStates {
  widgetProps: IWidgetWrapperProps
}

export class WidgetInViz extends React.Component<IWidgetWrapperProps, IWidgetInVizStates> {
  constructor (props) {
    super(props)
    this.state = {
      widgetProps: {...this.clearProps}
    }
  }

  private clearProps: IWidgetWrapperProps = {
    data: [],
    cols: [],
    rows: [],
    metrics: [],
    filters: [],
    chartStyles: getStyleConfig({}),
    selectedChart: ChartTypes.Table,
    queryParams: [],
    cache: false,
    expired: 300,
    orders: [],
    loading: false,
    mode: 'pivot',
    model: {}
  }

  public componentDidMount () {
    this.renderPivot(this.props)
  }

  public componentWillReceiveProps (nextProps) {
    this.renderPivot(nextProps)
  }

  private renderPivot = (props) => {
    const { metrics, rows, cols } = props
    const hasConfig = [metrics, rows, cols].some((item) => item.length > 0)
    if (props.data.length || !hasConfig) {
      this.setState({
        widgetProps: {...props}
      })
    } else {
      this.setState({
        widgetProps: {...this.clearProps}
      })
    }
  }

  public render () {
    return (
      <Widget {...this.state.widgetProps} />
    )
  }
}

export default WidgetInViz
