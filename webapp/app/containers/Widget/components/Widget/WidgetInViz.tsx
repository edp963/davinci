import * as React from 'react'
import Widget, { IWidgetWrapperProps } from './index'
import { getStyleConfig, getTable } from '../util'

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
    selectedChart: getTable().id,
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
    if (props.data.length === 0 && props.mode !== 'chart') {
      this.setState({
        widgetProps: {...this.clearProps}
      })
    } else {
      this.setState({
        widgetProps: {...props}
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
