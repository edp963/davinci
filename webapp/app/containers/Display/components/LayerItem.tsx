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
} from '../constants'
import Chart from '../../Dashboard/components/Chart'

const Resizable = require('react-resizable').Resizable
const ResizableBox = require('react-resizable').ResizableBox

const styles = require('../Display.less')
const stylesDashboard = require('../../Dashboard/Dashboard.less')

interface ILayerItemProps {
  scale: number
  slideParams: any
  layer: any
  layersStatus: object
  itemId: number,
  widget: any
  chartInfo: any
  data: any
  loading: boolean
  isInteractive: boolean
  interactId: string
  onGetChartData: (renderType: string, itemId: number, widgetId: number, queryParams?: any) => void
  onRenderChart: (itemId: number, widget: any, dataSource: any[], chartInfo: any, interactIndex?: number) => void
  onCheckTableInteract: (itemId: number) => object
  onDoTableInteract: (itemId: number, linkagers: any[], value: any) => void
  onSelectLayer: (obj: { id: any, selected: boolean, exclusive: boolean }) => void
  onResizeLayerStop: (layer: any, size: { width?: number, height?: number, positionX?: number, positionY?: number }, itemId: any) => void
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
    console.log('ctor: ', width, height)
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
    if (layer.graphType !== GraphTypes.Chart) {
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
    if (layer !== nextProps.layer) {
      this.setState({
        layerParams: JSON.parse(nextProps.layer.params)
      })
    }

    if (layer.graphType !== GraphTypes.Chart) {
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
    if (layer.graphType !== GraphTypes.Chart) {
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
    console.log('start: ', e.target !== data.node.lastElementChild)
    return e.target !== data.node.lastElementChild
  }

  private dragOnStop = (e, data) => {
    const {
      itemId,
      layer,
      onResizeLayerStop } = this.props
    const { x, y } = data
    const { layerParams } = this.state
    const params = {
      positionX:  Math.floor(x),
      positionY: Math.floor(y)
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

  private onResize = (e, { size }) => {
    const { width, height } = size
    this.setState({
      width,
      height
    })
  }

  private onResizeStop = () => {
    const { itemId, layer, onResizeLayerStop } = this.props
    const { layerParams, width, height } = this.state
    onResizeLayerStop(layer, { width, height }, itemId)
  }

  private onClickLayer = (e) => {
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
      [styles.selected]: layersStatus[layer.id]
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

    return (
      <div
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
            w={width}
            h={height}
            data={data || {}}
            loading={loading}
            chartInfo={chartInfo}
            updateConfig={updateConfig}
            chartParams={JSON.parse(widget['chart_params'])}
            updateParams={updateParams}
            currentBizlogicId={widget['flatTable_id']}
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
    const { width, height } = this.state
    const layerStyle: React.CSSProperties = {
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: `rgb(${layerParams.backgroundColor.join()},${layerParams.opacity / 100})`,
      border: `${layerParams.borderWidth}px ${layerParams.borderStyle} rgb(${layerParams.borderColor.join()}`,
      borderRadius: `${layerParams.borderRadius}px`,
      zIndex: layer.layerIndex
    }
    return layerStyle
  }

  private renderSecodaryGraphLayer = (layer) => {
    switch (layer.secondaryGraphType) {
      case SecondaryGraphTypes.Rectangle:
        return this.renderRectangleLayer(layer)
      case SecondaryGraphTypes.Label:
        return this.renderLabelLayer(layer)
      default:
        return ''
    }
  }

  private renderRectangleLayer = (layer) => {
    const {
      layerParams
    } = this.state

    const {
      layersStatus
    } = this.props

    const layerClass = classnames({
      [styles.layer]: true,
      [styles.rect]: true,
      [styles.selected]: layersStatus[layer.id]
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
    const { layersStatus } = this.props

    const layerClass = classnames({
      [styles.layer]: true,
      [styles.selected]: layersStatus[layer.id]
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

    const labelStyle: React.CSSProperties = {
      wordBreak: 'break-all',
      overflow: 'hidden',
      fontFamily,
      color: `rgb(${fontColor.join()})`,
      fontSize: `${fontSize}px`,
      textAlign,
      fontWeight: bold ? 'bold' : 'normal',
      fontStyle: italic ? 'italic' : 'normal',
      textDecoration: underline ? 'underline' : 'none',
      lineHeight: `${lineHeight}px`,
      textIndent: `${textIndent}px`,
      paddingTop: `${paddingTop}px`,
      paddingRight: `${paddingRight}px`,
      paddingBottom: `${paddingBottom}px`,
      paddingLeft: `${paddingLeft}px`
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
      scale,
      slideParams,
      layer,
      layersStatus
    } = this.props

    const {
      gridDistance
    } = slideParams

    const {
      layerParams,
      width,
      height } = this.state

    const defaultPosition = {
      x: layerParams['positionX'],
      y: layerParams['positionY']
    }

    return (
      <Draggable
        grid={[gridDistance * scale, gridDistance * scale]}
        bounds="parent"
        scale={scale}
        onStart={this.dragOnStart}
        onStop={this.dragOnStop}
        handle={`.${styles.layer}`}
        defaultPosition={defaultPosition}
      >
        <Resizable
          width={layerParams.width}
          height={layerParams.height}
          onResize={this.onResize}
          onResizeStop={this.onResizeStop}
          draggableOpts={{grid: [gridDistance * scale, gridDistance * scale]}}
          minConstraints={[50, 50]}
          maxConstraints={[slideParams.width - defaultPosition.x, slideParams.height - defaultPosition.y]}
          handleSize={[20, 20]}
        >
          {this.renderLayer(layer)}
        </Resizable>
      </Draggable>
    )
  }
}

export default LayerItem
