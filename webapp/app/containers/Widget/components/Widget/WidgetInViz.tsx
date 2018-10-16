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
    mode: 'pivot'
  }

  public componentDidMount () {
    this.renderPivot(this.props)
  }

  public componentWillReceiveProps (nextProps) {
    this.renderPivot(nextProps)
  }

  private renderPivot = (props) => {
    if (props.data.length) {
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
