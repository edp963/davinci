import * as React from 'react'
import * as classnames from 'classnames'

import Draggable from '../../../components/Draggable/react-draggable'
import widgetlibs from '../../../assets/json/widgetlib'

const Dropdown = require('antd/lib/dropdown')
const Menu = require('antd/lib/menu')

import { ECHARTS_RENDERER } from '../../../globalConstants'
import {
  GraphTypes,
  SecondaryGraphTypes
} from 'utils/util'
import Chart from '../../Dashboard/components/Chart'
import LayerContextMenu from './LayerContextMenu'

const Resizable = require('react-resizable').Resizable

const styles = require('../Display.less')
const stylesDashboard = require('../../Dashboard/Dashboard.less')

interface ILayerItemProps {
  pure: boolean
  scaleHeight: number
  scaleWidth: number
  slideParams?: any
  layer: any
  layersStatus?: object
  itemId: number
  widget: any
  chartInfo: any
  data: any
  loading: boolean
  isInteractive?: boolean
  interactId?: string
  onGetChartData: (renderType: string, itemId: number, widgetId: number, queryParams?: any) => void
  onRenderChart: (itemId: number, widget: any, dataSource: any[], chartInfo: any, interactIndex?: number) => void
  onCheckTableInteract?: (itemId: number) => object
  onDoTableInteract?: (itemId: number, linkagers: any[], value: any) => void
  onSelectLayer?: (obj: { id: any, selected: boolean, exclusive: boolean }) => void
  onDragLayer?: (itemId: number, delta: { deltaX: number, deltaY: number }) => void
  onResizeLayer?: (itemId: number, delta: { deltaWidth: number, deltaHeight: number }) => void
  onResizeLayerStop?: (layer: any, size: { width?: number, height?: number, positionX?: number, positionY?: number }, itemId: any) => void
}

interface ILayerItemStates {
  layerParams: any
  mousePos: number[]
  width: number
  height: number
}

export class LayerItem extends React.PureComponent<ILayerItemProps, ILayerItemStates> {
  constructor (props) {
    super(props)
    const { layer } = this.props
    const layerParams = JSON.parse(layer.params)
    const { width, height } = layerParams
    this.state = {
      layerParams,
      mousePos: [-1, -1],
      width,
      height
    }
  }

  public componentDidMount () {
    const {
      layer
    } = this.props
    if (layer.type !== GraphTypes.Chart) {
      return
    }

    const {
      itemId,
      widget,
      onGetChartData
    } = this.props

    onGetChartData('rerender', itemId, widget.id)
    this.setFrequent(this.props)
  }

  public componentWillReceiveProps (nextProps: ILayerItemProps) {
    const { layer } = this.props
    if (layer.params !== nextProps.layer.params) {
      const layerParams = JSON.parse(nextProps.layer.params)
      const { width, height } = layerParams
      this.setState({
        layerParams,
        width,
        height
      })
    }

    if (layer.type !== GraphTypes.Chart) {
      return
    }

    const {
      itemId,
      widget,
      data,
      chartInfo,
      onRenderChart
    } = nextProps

    if (data && data !== this.props.data && chartInfo.renderer === ECHARTS_RENDERER) {
      onRenderChart(itemId, widget, data.dataSource, chartInfo)
    }
    if (layer.triggerType !== nextProps.layer.triggerType) {
      this.setFrequent(nextProps)
    }
  }

  public componentWillUpdate (nextProps) {
    const {
      layer
    } = this.props
    if (layer.type !== GraphTypes.Chart) {
      return
    }

    const {
      itemId,
      widget,
      data,
      chartInfo,
      onRenderChart
    } = nextProps

    if (data && data !== this.props.data && chartInfo.renderer === ECHARTS_RENDERER) {
      onRenderChart(itemId, widget, data.dataSource, chartInfo)
    }
    if (layer.triggerType !== nextProps.layer.triggerType) {
      this.setFrequent(nextProps)
    }
  }

  public componentWillUnmount () {
    clearInterval(this.frequent)
  }

  private frequent: NodeJS.Timer = void 0

  private setFrequent = (props: ILayerItemProps) => {
    const {
      layer,
      itemId,
      widget,
      onGetChartData
    } = props
    if (layer.triggerType === 'frequent') {
      this.frequent = setInterval(() => {
        onGetChartData('dynamic', itemId, widget.id)
      }, Number(layer.triggerParams) * 1000)
    } else {
      clearInterval(this.frequent)
    }
  }

  private dragOnStart = (e, data) => {
    this.setState({
      mousePos: [e.pageX, e.pageY]
    })
    return e.target !== data.node.lastElementChild
  }

  private dragOnStop = (e, data) => {
    const {
      itemId,
      layer,
      slideParams,
      onResizeLayerStop } = this.props
    const { x, y } = data
    const { layerParams } = this.state
    const params = {
      positionX:  x,
      positionY: y
    }
    this.setState({
      layerParams: {
        ...layerParams,
        ...params
      }
    }, () => {
      onResizeLayerStop(layer, params, itemId)
    })
  }

  private drag = (e, data) => {
    const { lastX, lastY, x, y } = data
    const delta = { deltaX: x - lastX, deltaY: y - lastY }
    const { itemId, onDragLayer } = this.props
    if (onDragLayer) { onDragLayer(itemId, delta) }
  }

  private onResize = (e, { size }) => {
    const { width, height } = size
    const delta = {
      deltaWidth: width - this.state.width,
      deltaHeight: height - this.state.height
    }
    const { itemId, onResizeLayer } = this.props
    if (onResizeLayer) { onResizeLayer(itemId, delta) }
    this.setState({
      width,
      height
    })
  }

  private onResizeStop = () => {
    const { itemId, layer, onResizeLayerStop } = this.props
    const { width, height } = this.state
    this.setState({
      width,
      height
    }, () => {
      onResizeLayerStop(layer, { width, height }, itemId)
    })
  }

  private onClickLayer = (e) => {
    if (this.props.pure) { return }
    const mousePos = [e.pageX, e.pageY]
    const isSamePos = mousePos.every((pos, idx) => pos === this.state.mousePos[idx])
    if (!isSamePos) {
      return
    }
    const {
      layer,
      layersStatus,
      onSelectLayer
    } = this.props

    const { ctrlKey, metaKey } = e
    const exclusive = !ctrlKey && !metaKey
    onSelectLayer({ id: layer.id, selected: !layersStatus[layer.id], exclusive})
    e.stopPropagation()
  }

  private renderLayer = (layer) => {
    switch (layer.type) {
      case GraphTypes.Secondary:
        return this.renderSecondaryGraphLayer(layer)
      default:
        return this.renderChartLayer()
    }
  }

  private renderChartLayer = () => {
    const { scaleHeight, scaleWidth } = this.props
    if (scaleHeight <= 0 || scaleWidth <= 0) { return null }

    const {
      pure,
      layer,
      layersStatus,
      itemId,
      widget,
      chartInfo,
      data,
      loading,
      isInteractive,
      interactId,
      onCheckTableInteract,
      onDoTableInteract
    } = this.props
    const {
      layerParams,
      width,
      height } = this.state

    const layerClass = classnames({
      [styles.layer]: true,
      [styles.view]: !pure,
      [styles.selected]:  layersStatus && layersStatus[layer.id]
    })

    const layerStyle = this.getLayerStyle(layer, layerParams)

    const chartClass = {
      chart: styles.chartBlock,
      table: styles.tableBlock,
      container: styles.block
    }

    let updateParams
    let updateConfig
    let currentBizlogicId

    if (widget.config) {
      const config = JSON.parse(widget.config)
      currentBizlogicId = widget.flatTable_id
      // FIXME 前期误将 update_params 和 update_fields 字段 stringify 后存入数据库，此处暂时做判断避免问题，保存时不再 stringify，下个大版本后删除判断语句
      updateParams = typeof config['update_params'] === 'string'
        ? JSON.parse(config['update_params'])
        : config['update_params']
      updateConfig = typeof config['update_fields'] === 'string'
        ? JSON.parse(config['update_fields'])
        : config['update_fields']
    }

    const exactScaleHeight = pure ? scaleHeight : 1
    const exactScaleWidth = pure ? scaleWidth : 1
    const { chartParams } = JSON.parse(widget.config)
    return (
      <div
        id={`layer_${itemId}`}
        className={layerClass}
        style={layerStyle}
        onClick={this.onClickLayer}
      >
        <div className={styles.title}>
          <h4>{layer.name}</h4>
        </div>
        <div className={styles.body}>
          <Chart
            id={`${itemId}`}
            w={width * exactScaleWidth}
            h={height * exactScaleHeight}
            data={data || {}}
            loading={loading}
            chartInfo={chartInfo}
            updateConfig={updateConfig}
            chartParams={chartParams}
            updateParams={updateParams}
            currentBizlogicId={widget.viewId}
            classNames={chartClass}
            interactId={interactId}
            onCheckTableInteract={onCheckTableInteract}
            onDoTableInteract={onDoTableInteract}
          />
        </div>
      </div>
    )
  }

  private getLayerStyle = (layer, layerParams) => {
    const { pure, scaleHeight, scaleWidth } = this.props
    const { width, height } = this.state
    const layerStyle: React.CSSProperties = {
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: `rgb(${layerParams.backgroundColor.join()},${layerParams.opacity / 100})`,
      border: `${layerParams.borderWidth}px ${layerParams.borderStyle} rgb(${layerParams.borderColor.join()}`,
      borderRadius: `${layerParams.borderRadius}px`,
      zIndex: layer.index
    }
    if (layerParams.backgroundImage) {
      layerStyle.backgroundImage = `url("${layerParams.backgroundImage}")`
    }
    if (pure) {
      layerStyle.position = 'absolute'
      layerStyle.top = `${layerParams.positionY * scaleHeight}px`
      layerStyle.left = `${layerParams.positionX * scaleWidth}px`
      layerStyle.width = `${width * scaleWidth}px`
      layerStyle.height = `${height * scaleHeight}px`
    }
    return layerStyle
  }

  private renderSecondaryGraphLayer = (layer) => {
    switch (layer.subType) {
      case SecondaryGraphTypes.Rectangle:
        return this.renderRectangleLayer(layer)
      case SecondaryGraphTypes.Label:
        return this.renderLabelLayer(layer)
      default:
        return null
    }
  }

  private renderRectangleLayer = (layer) => {
    const {
      layerParams
    } = this.state

    const {
      pure,
      layersStatus
    } = this.props

    const layerClass = classnames({
      [styles.layer]: true,
      [styles.view]: !pure,
      [styles.rect]: true,
      [styles.selected]: layersStatus && layersStatus[layer.id]
    })

    const layerStyle = this.getLayerStyle(layer, layerParams)

    return (
      <div
        className={layerClass}
        style={layerStyle}
        onClick={this.onClickLayer}
      />
    )
  }

  private renderLabelLayer = (layer) => {
    const { layerParams } = this.state
    const { pure, scaleHeight, scaleWidth, layersStatus } = this.props

    const layerClass = classnames({
      [styles.layer]: true,
      [styles.view]: !pure,
      [styles.selected]: layersStatus && layersStatus[layer.id]
    })
    const layerStyle = this.getLayerStyle(layer, layerParams)
    const {
      fontFamily,
      fontColor,
      fontSize,
      textAlign,
      bold,
      italic,
      underline,
      lineHeight,
      textIndent,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight
    } = layerParams

    const exactScaleHeight = pure ? scaleHeight : 1
    const exactScaleWidth = pure ? scaleWidth : 1
    const labelStyle: React.CSSProperties = {
      wordBreak: 'break-all',
      overflow: 'hidden',
      fontFamily,
      color: `rgb(${fontColor.join()})`,
      fontSize: `${fontSize * Math.min(exactScaleHeight, exactScaleWidth)}px`,
      textAlign,
      fontWeight: bold ? 'bold' : 'normal',
      fontStyle: italic ? 'italic' : 'normal',
      textDecoration: underline ? 'underline' : 'none',
      lineHeight: `${lineHeight * exactScaleHeight}px`,
      textIndent: `${textIndent * exactScaleWidth}px`,
      paddingTop: `${paddingTop * exactScaleHeight}px`,
      paddingRight: `${paddingRight * exactScaleWidth}px`,
      paddingBottom: `${paddingBottom * exactScaleHeight}px`,
      paddingLeft: `${paddingLeft * exactScaleWidth}px`
    }
    return (
      <div
        className={layerClass}
        style={layerStyle}
        onClick={this.onClickLayer}
      >
        <p style={labelStyle}>
          {layerParams.contentText}
        </p>
      </div>
    )
  }

  public render () {
    const {
      pure,
      scaleHeight,
      scaleWidth,
      slideParams,
      layer,
      layersStatus
    } = this.props

    const {
      layerParams,
      width,
      height } = this.state

    const position = {
      x: layerParams['positionX'],
      y: layerParams['positionY']
    }

    const content = this.renderLayer(layer)
    if (pure) { return content }

    const {
      gridDistance
    } = slideParams

    return (
      <Draggable
        grid={[gridDistance, gridDistance]}
        bounds="parent"
        scale={Math.min(scaleHeight, scaleWidth)}
        onStart={this.dragOnStart}
        onStop={this.dragOnStop}
        onDrag={this.drag}
        handle={`.${styles.layer}`}
        position={position}
      >
        <Resizable
          width={layerParams.width}
          height={layerParams.height}
          onResize={this.onResize}
          onResizeStop={this.onResizeStop}
          draggableOpts={{grid: [gridDistance, gridDistance]}}
          minConstraints={[50, 50]}
          maxConstraints={[slideParams.width - position.x, slideParams.height - position.y]}
          handleSize={[20, 20]}
        >
            {content}
        </Resizable>
      </Draggable>
    )
  }
}

export default LayerItem
