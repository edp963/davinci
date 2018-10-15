import * as React from 'react'
import { findDOMNode } from 'react-dom'
import * as classnames from 'classnames'

const Tooltip = require('antd/lib/tooltip')
import Draggable from 'libs/react-draggable'

// @TODO contentMenu
// const Dropdown = require('antd/lib/dropdown')
// const Menu = require('antd/lib/menu')
// import LayerContextMenu from './LayerContextMenu'

import {
  GraphTypes,
  SecondaryGraphTypes
} from './util'
import { GRID_ITEM_MARGIN } from '../../../globalConstants'
import { IWidgetProps, RenderType } from '../../Widget/components/Widget'
import Widget from '../../Widget/components/Widget/WidgetInViz'

const Resizable = require('libs/react-resizable').Resizable

const styles = require('../Display.less')

interface ILayerItemProps {
  pure: boolean
  scale: [number, number]
  slideParams?: any
  layer: any
  selected?: boolean
  resizing?: boolean
  dragging?: boolean
  itemId: number
  widget: any
  data: any
  loading: boolean
  polling: string
  frequency: string
  interactId: string
  rendered?: boolean
  renderType: RenderType
  onGetChartData: (renderType: RenderType, itemId: number, widgetId: number, queryParams?: any) => void
  onCheckTableInteract?: (itemId: number) => object
  onDoTableInteract?: (itemId: number, linkagers: any[], value: any) => void
  onSelectLayer?: (obj: { id: any, selected: boolean, exclusive: boolean }) => void
  onDragLayer?: (itemId: number, delta: { deltaX: number, deltaY: number }) => void
  onDragLayerStop?: (itemId: number, delta: { deltaX: number, deltaY: number }) => void
  onResizeLayer?: (itemId: number, delta: { deltaWidth: number, deltaHeight: number }) => void
  onResizeLayerStop?: (itemId: number, delta: { deltaWidth: number, deltaHeight: number }) => void
}

interface ILayerItemStates {
  layerParams: ILayerParams
  layerTooltipPosition: [number, number]
  mousePos: number[]
  widgetProps: IWidgetProps
}

export class LayerItem extends React.PureComponent<ILayerItemProps, ILayerItemStates> {
  private refLayer

  constructor (props) {
    super(props)
    const { layer } = this.props
    const layerParams = JSON.parse(layer.params)
    this.state = {
      layerParams,
      layerTooltipPosition: [0, 0],
      mousePos: [-1, -1],
      widgetProps: null
    }
  }

  public componentWillMount () {
    const { widget } = this.props
    if (!widget) { return }

    this.setState({
      widgetProps: JSON.parse(widget.config)
    })
  }

  public componentDidMount () {
      const { itemId, layer, widget, onGetChartData } = this.props
      if (layer.type !== GraphTypes.Chart) { return }

      onGetChartData('clear', itemId, widget.id)
      this.setFrequent(this.props)
  }

  public componentWillReceiveProps (nextProps: ILayerItemProps) {
    const { layer } = this.props
    if (layer.params !== nextProps.layer.params) {
      const layerParams = JSON.parse(nextProps.layer.params)
      this.setState({
        layerParams
      })
    }

    if (this.props.widget !== nextProps.widget) {
      this.setState({
        widgetProps: JSON.parse(nextProps.widget.config)
      })
    }
  }

  public componentWillUpdate (nextProps: ILayerItemProps) {
    const {
      polling,
      layer
    } = nextProps
    if (layer.type !== GraphTypes.Chart) {
      return
    }
    if (polling !== this.props.polling) {
      this.setFrequent(nextProps)
    }
  }

  public componentDidUpdate () {
    const rect = findDOMNode(this.refLayer).getBoundingClientRect()
    const { top, height, right } = rect
    const [ x, y ] = this.state.layerTooltipPosition
    const [newX, newY] = [top + height / 2, right]
    if (x !== newX || y !== newY) {
      this.setState({
        layerTooltipPosition: [newX, newY]
      })
    }
  }

  public componentWillUnmount () {
    clearInterval(this.frequent)
  }

  private frequent: number

  private setFrequent = (props: ILayerItemProps) => {
    const {
      polling,
      frequency,
      itemId,
      widget,
      onGetChartData
    } = props

    clearInterval(this.frequent)

    if (polling === 'true' && frequency) {
      this.frequent = window.setInterval(() => {
        onGetChartData('refresh', itemId, widget.id)
      }, Number(frequency) * 1000)
    }
  }

  private dragOnStart = (e, data) => {
    e.stopPropagation()
    this.setState({
      mousePos: [e.pageX, e.pageY]
    })
    console.log('drag starts')
    return e.target !== data.node.lastElementChild
  }

  private dragOnStop = (e: Event, data) => {
    e.stopPropagation()
    const { deltaX, deltaY } = data
    const {
      itemId,
      onDragLayerStop } = this.props
    console.log('drag stops')
    onDragLayerStop(itemId, { deltaX, deltaY })
  }

  private onDrag = (e, { deltaX, deltaY }) => {
    e.stopPropagation()
    console.log('dragging')
    const { itemId, onDragLayer } = this.props
    if (onDragLayer) { onDragLayer(itemId, { deltaX, deltaY }) }
  }

  private onResize = (e, { size }) => {
    e.stopPropagation()
    const { itemId, onResizeLayer } = this.props
    const { width: prevWidth, height: prevHeight } = this.state.layerParams
    const { width, height } = size
    const delta = {
      deltaWidth:  width - prevWidth,
      deltaHeight: height - prevHeight
    }
    if (onResizeLayer) { onResizeLayer(itemId, delta) }
  }

  private onResizeStop = (e, { size }) => {
    e.stopPropagation()
    const { width: prevWidth, height: prevHeight } = this.state.layerParams
    const { width, height } = size
    const delta = {
      deltaWidth:  width - prevWidth,
      deltaHeight: height - prevHeight
    }
    const { itemId, onResizeLayerStop } = this.props
    onResizeLayerStop(itemId, delta)
  }

  private onClickLayer = (e) => {
    e.stopPropagation()
    if (this.props.pure) { return }
    const mousePos = [e.pageX, e.pageY]
    const isSamePos = mousePos.every((pos, idx) => pos === this.state.mousePos[idx])
    if (!isSamePos) {
      return
    }
    const {
      layer,
      selected,
      onSelectLayer
    } = this.props

    const { ctrlKey, metaKey } = e
    const exclusive = !ctrlKey && !metaKey
    onSelectLayer({ id: layer.id, selected: !selected, exclusive})
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
    const { scale } = this.props
    if (scale[0] <= 0 || scale[1] <= 0) { return null }

    const {
      pure,
      layer,
      selected,
      itemId,
      widget,
      data,
      loading,
      renderType,
      interactId,
      onCheckTableInteract,
      onDoTableInteract
    } = this.props
    const {
      layerParams,
      widgetProps } = this.state

    const layerClass = classnames({
      [styles.layer]: true,
      [styles.view]: !pure,
      [styles.selected]:  selected
    })

    const layerStyle = this.getLayerStyle(layer, layerParams)

    return (
      <div
        ref={(f) => this.refLayer = f}
        id={`layer_${layer.id}`}
        className={layerClass}
        style={layerStyle}
        onClick={this.onClickLayer}
      >
        {this.wrapLayerTooltip(
          (<Widget
            {...widgetProps}
            data={data || []}
            loading={loading}
            renderType={renderType}
          />)
        )}
      </div>
    )
  }

  private getLayerStyle = (layer, layerParams) => {
    const { pure, scale } = this.props
    const {
      width, height,
      backgroundImage, backgroundRepeat, backgroundSize, backgroundColor, opacity,
      borderWidth, borderStyle, borderColor, borderRadius } = layerParams
    let layerStyle: React.CSSProperties = {
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: `rgb(${backgroundColor.join()},${opacity / 100})`,
      border: `${borderWidth}px ${borderStyle} rgb(${borderColor.join()}`,
      borderRadius: `${borderRadius}px`,
      zIndex: layer.index
    }
    if (backgroundImage) {
      layerStyle.background = `${backgroundRepeat} ${backgroundSize} url("${backgroundImage}")`
    }
    if (pure) {
      layerStyle = {
        ...layerStyle,
        position: 'absolute',
        left: `${layerParams.positionX * scale[0]}px`,
        top: `${layerParams.positionY * scale[1]}px`,
        width: `${width * scale[0]}px`,
        height: `${height * scale[1]}px`
      }
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
      selected
    } = this.props

    const layerClass = classnames({
      [styles.layer]: true,
      [styles.view]: !pure,
      [styles.rect]: true,
      [styles.selected]: selected
    })

    const layerStyle = this.getLayerStyle(layer, layerParams)

    return (
      <div
        ref={(f) => this.refLayer = f}
        className={layerClass}
        style={layerStyle}
        onClick={this.onClickLayer}
      >
        {this.wrapLayerTooltip(null)}
      </div>
    )
  }

  private renderLabelLayer = (layer) => {
    const { layerParams } = this.state
    const { pure, scale, selected } = this.props

    const layerClass = classnames({
      [styles.layer]: true,
      [styles.view]: !pure,
      [styles.selected]: selected
    })
    const layerStyle = this.getLayerStyle(layer, layerParams)
    const {
      fontFamily,
      fontColor,
      fontSize,
      textAlign,
      textStyle,
      lineHeight,
      textIndent,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight
    } = layerParams

    const exactScaleWidth = pure ? scale[0] : 1
    const exactScaleHeight = pure ? scale[1] : 1
    const labelStyle: React.CSSProperties = {
      wordBreak: 'break-all',
      overflow: 'hidden',
      fontFamily,
      color: `rgb(${fontColor.join()})`,
      fontSize: `${fontSize * Math.min(exactScaleHeight, exactScaleWidth)}px`,
      textAlign,
      lineHeight: `${lineHeight * exactScaleHeight}px`,
      textIndent: `${textIndent * exactScaleWidth}px`,
      paddingTop: `${paddingTop * exactScaleHeight}px`,
      paddingRight: `${paddingRight * exactScaleWidth}px`,
      paddingBottom: `${paddingBottom * exactScaleHeight}px`,
      paddingLeft: `${paddingLeft * exactScaleWidth}px`
    }
    if (textStyle) {
      layerStyle.fontWeight = textStyle.indexOf('bold') > -1 ? 'bold' : 'normal'
      layerStyle.fontStyle = textStyle.indexOf('italic') > -1 ? 'italic' : 'normal'
      layerStyle.textDecoration = textStyle.indexOf('underline') > -1 ? 'underline' : 'none'
    }
    return (
      <div
        ref={(f) => this.refLayer = f}
        className={layerClass}
        style={layerStyle}
        onClick={this.onClickLayer}
      >
        {this.wrapLayerTooltip(
          <p style={labelStyle}>
            {layerParams.contentText}
          </p>
        )}
      </div>
    )
  }

  private wrapLayerTooltip = (content) => {
    const { resizing, dragging } = this.props
    if (!resizing && !dragging) { return content }

    const { layerParams, layerTooltipPosition } = this.state
    const { positionX, positionY, width, height } = layerParams
    const tooltip = resizing ? `宽度：${width}px，高度：${height}px` : (dragging ? `x：${positionX}px，y：${positionY}px` : '')
    const tooltipVisible = resizing || dragging
    const [top, left] = layerTooltipPosition
    const style = { top, left }
    return (
      <Tooltip title={tooltip} overlayStyle={style} placement="right" visible={tooltipVisible}>{content}</Tooltip>
    )
  }

  public render () {
    const {
      pure,
      scale,
      slideParams,
      layer
    } = this.props

    const { layerParams } = this.state
    const { positionX: x, positionY: y, width, height } = layerParams

    const position = { x, y}

    const content = this.renderLayer(layer)
    if (pure) { return content }

    const maxConstraints = [slideParams.width - position.x, slideParams.height - position.y]

    return (
      <Draggable
        grid={[1, 1]}
        bounds="parent"
        scale={Math.min(scale[0], scale[1])}
        onStart={this.dragOnStart}
        onStop={this.dragOnStop}
        onDrag={this.onDrag}
        handle={`.${styles.layer}`}
        position={position}
      >
        <Resizable
          width={width}
          height={height}
          onResize={this.onResize}
          onResizeStop={this.onResizeStop}
          draggableOpts={{grid: [1, 1]}}
          minConstraints={[50, 50]}
          maxConstraints={maxConstraints}
          handleSize={[20, 20]}
          scale={Math.min(scale[0], scale[1])}
        >
          {content}
        </Resizable>
      </Draggable>
    )
  }
}

export default LayerItem

export interface ILayer {
  id: number
  displaySlideId: number
  index: number
  name: string
  params: string
  subType: SecondaryGraphTypes
  type: GraphTypes
  widgetId: number
}

export interface ILayerParams {
  backgroundColor: [number, number, number]
  borderColor: [number, number, number]
  borderRadius: number
  borderStyle: string
  borderWidth: number
  frequency: number
  height: number
  opacity: number
  polling: 'true' | 'false'
  positionX: number
  positionY: number
  width: number
  fontFamily: string
  fontColor: [number, number, number]
  fontSize: number
  textAlign: string
  textStyle: string
  lineHeight: number
  textIndent: number
  paddingTop: number
  paddingBottom: number
  paddingLeft: number
  paddingRight: number
  contentText: string
}

