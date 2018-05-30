import * as React from 'react'
import { connect } from 'react-redux'
import * as classnames from 'classnames'
import { createStructuredSelector } from 'reselect'
import { makeSelectLayerStatus } from '../selectors'
import {
  updateLayerStatus
} from '../actions'

import Draggable from '../../../components/Draggable/react-draggable'
import widgetlibs from '../../../assets/json/widgetlib'

const Dropdown = require('antd/lib/dropdown')
const Menu = require('antd/lib/menu')

import { ECHARTS_RENDERER } from '../../../globalConstants'
import {
  GraphTypes,
  SecondaryGraphTypes
} from '../constants'
import Chart from '../../Dashboard/components/Chart'

const Resizable = require('react-resizable').Resizable
const ResizableBox = require('react-resizable').ResizableBox

const styles = require('../Display.less')
const stylesDashboard = require('../../Dashboard/Dashboard.less')

interface ILayerItemProps {
  itemId?: any,
  displayParams: any
  layer: any
  layerStatus?: object
  onGetChartData?: any
  onUpdateLayerStatus?: any
  onResizeLayer: any
  data?: any
}

interface ILayerItemStates {
  layerParams: any
  mousePos: number[]
}

export class LayerItem extends React.PureComponent<ILayerItemProps, ILayerItemStates> {
  constructor (props) {
    super(props)
    const { layer } = this.props
    this.state = {
      layerParams: JSON.parse(layer['layer_params']),
      mousePos: [-1, -1]
    }
  }

  public componentDidMount () {
    const {
      itemId,
      layer,
      onGetChartData
    } = this.props

    onGetChartData('rerender', itemId, layer.id)
  }

  public componentWillUpdate (nextProps) {
    const {
      itemId,
      layer,
      data,
      chartInfo,
      onRenderChart
    } = nextProps

    if (data && data !== this.props.data && chartInfo.renderer === ECHARTS_RENDERER) {
      onRenderChart(itemId, layer, data.dataSource, chartInfo)
    }
  }

  private menu = (
    <Menu>
      <Menu.Item>
        复制
      </Menu.Item>
    </Menu>
  )

  private dragOnStart = (e, data) => {
    this.setState({
      mousePos: [e.pageX, e.pageY]
    })
    return e.target !== data.node.lastElementChild
  }

  private onResize = (e, { size }) => {
    const { layer, onResizeLayer } = this.props
    const { layerParams } = this.state
    const { width, height } = size
    this.setState({
      layerParams: {
        ...layerParams,
        width,
        height
      }
    }, () => {
      onResizeLayer(layer.id, size)
    })
  }

  private onClickLayer = (e) => {
    const mousePos = [e.pageX, e.pageY]
    const isSamePos = mousePos.every((pos, idx) => pos === this.state.mousePos[idx])
    if (!isSamePos) {
      return
    }
    const {
      layer,
      layerStatus,
      onUpdateLayerStatus
    } = this.props

    onUpdateLayerStatus({ id: layer.id, selected: !layerStatus[layer.id]})
  }

  private renderLayer = (layer) => {
    switch (layer.graphType) {
      case GraphTypes.Secondary:
        return this.renderSecodaryGraphLayer(layer)
      default:
        return this.renderChartLayer()
    }
  }

  private renderChartLayer = () => {
    const {
      layer,
      layerStatus
    } = this.props
    const { layerParams } = this.state

    const layerClass = classnames({
      [styles.layer]: true,
      [styles.selected]: layerStatus[layer.id]
    })

    const chartClass = {
      chart: stylesDashboard.chartBlock,
      table: stylesDashboard.tableBlock,
      container: stylesDashboard.block
    }

    const chartInfo = widgetlibs.find((wl) => wl.id === layer.widgetlib_id)

    return (
      <div
        className={layerClass}
        style={{width: layerParams.width + 'px', height: layerParams.height + 'px'}}
        onClick={this.onClickLayer}
      >
        <div className={styles.title}>
          <h4>{layer.name}</h4>
        </div>
        <Chart
          w={layerParams.width}
          h={layerParams.height}
          title={layer.name}
          data={{}}
          chartInfo={chartInfo}
          classNames={chartClass}
        />
      </div>
    )
  }

  private renderSecodaryGraphLayer = (layer) => {
    switch (layer.secondaryGraphType) {
      case SecondaryGraphTypes.Rectangle:
        return this.renderRectangleLayer(layer)
      default:
        return ''
    }
  }

  private renderRectangleLayer = (layer) => {
    const {
      layerParams
    } = this.state

    const {
      layerStatus
    } = this.props

    const layerClass = classnames({
      [styles.layer]: true,
      [styles.rect]: true,
      [styles.selected]: layerStatus[layer.id]
    })

    return (
      <div
        className={layerClass}
        style={{width: layerParams.width + 'px', height: layerParams.height + 'px'}}
        onClick={this.onClickLayer}
      />
    )
  }

  public render () {
    const {
      displayParams,
      layer,
      layerStatus
    } = this.props

    const {
      gridDistance,
      scale
    } = displayParams

    const { layerParams } = this.state

    return (
      <Draggable
            grid={[gridDistance * scale, gridDistance * scale]}
            bounds="parent"
            scale={scale}
            onStart={this.dragOnStart}
            handle={`.${styles.layer}`}
      >
        <Resizable
          style={{width: layerParams.width + 'px', height: layerParams.height + 'px'}}
          width={layerParams.width}
          height={layerParams.height}
          onResize={this.onResize}
          draggableOpts={{grid: [gridDistance * scale, gridDistance * scale]}}
        >
          {this.renderLayer(layer)}
        </Resizable>
      </Draggable>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  layerStatus: makeSelectLayerStatus()
})

function mapDispatchToProps (dispatch) {
  return {
    onUpdateLayerStatus: (({ id, selected }) => dispatch(updateLayerStatus({ id, selected })))
  }
}

export default connect<{}, {}, ILayerItemProps>(mapStateToProps, mapDispatchToProps)(LayerItem)
