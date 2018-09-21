import * as React from 'react'
import ScrollablePivot from './index'
import { IPivotProps } from './Pivot'
import { getStyleConfig } from '../util'

interface IPivotInVizStates {
  pivotProps: IPivotProps
}

export class PivotInViz extends React.Component<IPivotProps, IPivotInVizStates> {
  constructor (props) {
    super(props)
    this.state = {
      pivotProps: {...this.clearProps}
    }
  }

  private clearProps = {
    data: [],
    cols: [],
    rows: [],
    metrics: [],
    filters: [],
    chartStyles: getStyleConfig({}),
    queryParams: [],
    cache: false,
    expired: 300,
    orders: []
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
        pivotProps: {...props}
      })
    } else {
      this.setState({
        pivotProps: {...this.clearProps}
      })
    }
  }

  public render () {
    return (
      <ScrollablePivot {...this.state.pivotProps} />
    )
  }
}

export default PivotInViz
