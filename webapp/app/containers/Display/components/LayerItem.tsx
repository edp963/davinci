import * as React from 'react'
import * as classnames from 'classnames'

import Draggable from '../../../components/Draggable/react-draggable'

// @TODO contentMenu
// const Dropdown = require('antd/lib/dropdown')
// const Menu = require('antd/lib/menu')
// import LayerContextMenu from './LayerContextMenu'

import {
  GraphTypes,
  SecondaryGraphTypes
} from 'utils/util'
import Pivot from '../../Widget/components/Pivot/PivotInViz'
import { IPivotProps, RenderType } from '../../Widget/components/Pivot/Pivot'

const Resizable = require('react-resizable').Resizable

const styles = require('../Display.less')

interface ILayerItemProps {
  pure: boolean
  scale: [number, number]
  slideParams?: any
  layer: any
  selected?: boolean
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
  onResizeLayer?: (itemId: number, delta: { deltaWidth: number, deltaHeight: number }) => void
  onResizeLayerStop?: (layer: any, size: { width?: number, height?: number, positionX?: number, positionY?: number }, itemId: any) => void
}

interface ILayerItemStates {
  layerParams: any
  mousePos: number[]
  width: number
  height: number,
  pivotProps: IPivotProps
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
      height,
      pivotProps: null
    }
  }

  public componentWillMount () {
    const { widget } = this.props
    if (!widget) { return }
    this.setState({
      pivotProps: JSON.parse(widget.config)
    })
  }

  public componentDidMount () {
      const { itemId, widget, onGetChartData } = this.props
      onGetChartData('clear', itemId, widget.id)
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

    if (this.props.widget !== nextProps.widget) {
      this.setState({
        pivotProps: JSON.parse(nextProps.widget.config)
      })
    }

    if (layer.type !== GraphTypes.Chart) {
      return
    }
  }

  public componentWillUpdate (nextProps: ILayerItemProps) {
    const {
      itemId,
      widget,
      polling,
      onGetChartData,
      rendered,
      layer
    } = nextProps

    if (layer.type !== GraphTypes.Chart) {
      return
    }

    if (polling !== this.props.polling) {
      this.setFrequent(nextProps)
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
      layer,
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
    this.setState({
      mousePos: [e.pageX, e.pageY]
    })
    return e.target !== data.node.lastElementChild
  }

  private dragOnStop = (_, data) => {
    const {
      itemId,
      layer,
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

  private drag = (_, data) => {
    const { lastX, lastY, x, y } = data
    const delta = { deltaX: x - lastX, deltaY: y - lastY }
    const { itemId, onDragLayer } = this.props
    if (onDragLayer) { onDragLayer(itemId, delta) }
  }

  private onResize = (_, { size }) => {
    const { width, height } = size
    const delta = {
      deltaWidth: width - this.state.width,
      deltaHeight: height - this.state.height
    }
    const { itemId, selected, onResizeLayer } = this.props
    if (onResizeLayer && selected) { onResizeLayer(itemId, delta) }
    this.setState({
      width,
      height
    })
  }

  private onResizeStop = (_, { size }) => {
    const { itemId, layer, onResizeLayerStop } = this.props
    const { width, height } = size
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
      selected,
      onSelectLayer
    } = this.props

    const { ctrlKey, metaKey } = e
    const exclusive = !ctrlKey && !metaKey
    onSelectLayer({ id: layer.id, selected: !selected, exclusive})
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
      width,
      height,
      pivotProps } = this.state

    const layerClass = classnames({
      [styles.layer]: true,
      [styles.view]: !pure,
      [styles.selected]:  selected
    })

    const layerStyle = this.getLayerStyle(layer, layerParams)

    const chartClass = {
      chart: styles.chartBlock,
      table: styles.tableBlock,
      container: styles.block
    }

    const exactScaleWidth = pure ? scale[0] : 1
    const exactScaleHeight = pure ? scale[1] : 1
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
          <Pivot
            {...pivotProps}
            data={data || []}
            renderType={renderType}
          />
        </div>
      </div>
    )
  }

  private getLayerStyle = (layer, layerParams) => {
    const { pure, scale } = this.props
    const { width, height } = this.state
    const {
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
        className={layerClass}
        style={layerStyle}
        onClick={this.onClickLayer}
      />
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
      scale,
      slideParams,
      layer,
      selected
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

    const maxConstraints = [slideParams.width - position.x, slideParams.height - position.y]

    return (
      <Draggable
        grid={[gridDistance, gridDistance]}
        bounds="parent"
        scale={Math.min(scale[0], scale[1])}
        onStart={this.dragOnStart}
        onStop={this.dragOnStop}
        onDrag={this.drag}
        handle={`.${styles.layer}`}
        position={position}
      >
        <Resizable
          width={width}
          height={height}
          onResize={this.onResize}
          onResizeStop={this.onResizeStop}
          draggableOpts={{grid: [gridDistance, gridDistance]}}
          minConstraints={[50, 50]}
          maxConstraints={maxConstraints}
          handleSize={[20, 20]}
        >
            {content}
        </Resizable>
      </Draggable>
    )
  }
}

export default LayerItem
