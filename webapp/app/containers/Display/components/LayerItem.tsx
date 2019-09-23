import * as React from 'react'
import { findDOMNode } from 'react-dom'
import * as classnames from 'classnames'
import moment from 'moment'

import { Tooltip, Icon } from 'antd'
import Draggable from 'libs/react-draggable'
import Video from 'components/Video'

// @TODO contentMenu
// import Dropdown from 'antd/lib/dropdown'
// import Menu from 'antd/lib/menu'
// import LayerContextMenu from './LayerContextMenu'

import {
  GraphTypes,
  SecondaryGraphTypes
} from './util'
import { GRID_ITEM_MARGIN } from 'app/globalConstants'
import { IViewModel } from 'containers/View/types'
import Widget, { IWidgetConfig, IPaginationParams, RenderType } from 'containers/Widget/components/Widget'
import { TextAlignProperty } from 'csstype'

import { Resizable } from 'libs/react-resizable'

const styles = require('../Display.less')

interface ILayerItemProps {
  pure: boolean
  scale?: [number, number]
  slideParams?: any
  layer: any
  selected?: boolean
  resizing?: boolean
  dragging?: boolean
  itemId: number
  widget: any
  model: IViewModel
  datasource: {
    pageNo: number
    pageSize: number
    resultList: any[]
    totalCount: number
  }
  loading: boolean
  polling: string
  frequency: string
  interactId: string
  rendered?: boolean
  renderType: RenderType
  onGetChartData: (renderType: RenderType, itemId: number, widgetId: number, queryConditions?: any) => void
  onCheckTableInteract?: (itemId: number) => object
  onDoTableInteract?: (itemId: number, linkagers: any[], value: any) => void
  onSelectLayer?: (obj: { id: any, selected: boolean, exclusive: boolean }) => void
  onDragLayer?: (itemId: number, deltaPosition: IDeltaPosition) => void
  onDragLayerStop?: (itemId: number, deltaPosition: IDeltaPosition) => void
  onResizeLayer?: (itemId: number, deltaSize: IDeltaSize) => void
  onResizeLayerStop?: (itemId: number, deltaSize: IDeltaSize) => void
  onEditWidget?: (itemId: number, widgetId: number) => void
}

interface ILayerItemStates {
  layerParams: ILayerParams
  pagination: IPaginationParams
  nativeQuery: boolean
  layerTooltipPosition: [number, number]
  mousePos: number[]
  widgetProps: IWidgetConfig
  currentTime: string
}

export class LayerItem extends React.PureComponent<ILayerItemProps, ILayerItemStates> {
  private refLayer

  public static defaultProps: Partial<ILayerItemProps> = {
    scale: [1, 1]
  }

  constructor (props) {
    super(props)
    const { layer } = this.props
    const layerParams = JSON.parse(layer.params)
    this.state = {
      layerParams,
      pagination: null,
      nativeQuery: false,
      layerTooltipPosition: [0, 0],
      mousePos: [-1, -1],
      widgetProps: null,
      currentTime: ''
    }
  }

  public componentWillMount () {
    const { widget, datasource } = this.props
    if (!widget) { return }

    const widgetProps = JSON.parse(widget.config)
    const pagination = this.getPagination(widgetProps, datasource)
    const nativeQuery = this.getNativeQuery(widgetProps)
    this.setState({
      widgetProps,
      pagination,
      nativeQuery
    })
  }

  public componentDidMount () {
    const { itemId, layer, widget, onGetChartData } = this.props
    if (layer.type !== GraphTypes.Chart) { return }

    const { pagination, nativeQuery } = this.state
    onGetChartData('clear', itemId, widget.id, { pagination, nativeQuery })
    this.initPolling(this.props)
  }

  private getPagination = (widgetProps: IWidgetConfig, datasource) => {
    const { chartStyles } = widgetProps
    const { table } = chartStyles
    if (!table) { return null }

    const { withPaging, pageSize } = table
    const pagination: IPaginationParams = {
      withPaging,
      pageSize: 0,
      pageNo: 0,
      totalCount: datasource.totalCount || 0
    }
    if (pagination.withPaging) {
      pagination.pageSize = datasource.pageSize || +pageSize
      pagination.pageNo = datasource.pageNo || 1
    }
    return pagination
  }

  private getNativeQuery = (widgetProps: IWidgetConfig) => {
    let noAggregators = false
    const { chartStyles } = widgetProps
    const { table } = chartStyles
    if (table) {
      noAggregators = table.withNoAggregators
    }
    return noAggregators
  }

  public componentWillReceiveProps (nextProps: ILayerItemProps) {
    const { layer, datasource } = this.props
    if (layer.params !== nextProps.layer.params) {
      const layerParams: ILayerParams = JSON.parse(nextProps.layer.params)
      if (layer.subType === SecondaryGraphTypes.Timer) {
        const { timeFormat } = layerParams
        this.setState({
          layerParams,
          currentTime: moment().format(timeFormat || 'YYYY-MM-dd HH:mm:ss')
        })
      }
      this.setState({ layerParams })
    }

    let widgetProps = this.state.widgetProps
    if (this.props.widget !== nextProps.widget) {
      widgetProps = JSON.parse(nextProps.widget.config)
      this.setState({ widgetProps })
    }

    if (widgetProps && datasource !== nextProps.datasource) {
      const pagination = this.getPagination(widgetProps, nextProps.datasource)
      this.setState({ pagination })
    }
  }

  public componentWillUpdate (nextProps: ILayerItemProps) {
    const {
      polling,
      frequency,
      layer
    } = nextProps
    if (layer.type !== GraphTypes.Chart) {
      return
    }
    if (polling !== this.props.polling || frequency !== this.props.frequency) {
      this.initPolling(nextProps)
    }
  }

  public componentDidUpdate () {
    const rect = (findDOMNode(this.refLayer) as Element).getBoundingClientRect()
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
    clearInterval(this.pollingTimer)
    clearInterval(this.timer)
  }

  private pollingTimer: number

  private initPolling = (props: ILayerItemProps) => {
    const {
      polling,
      frequency,
      itemId,
      widget,
      onGetChartData
    } = props

    clearInterval(this.pollingTimer)

    if (polling === 'true' && frequency) {
      const { pagination, nativeQuery } = this.state
      this.pollingTimer = window.setInterval(() => {
        onGetChartData('refresh', itemId, widget.id, { pagination, nativeQuery })
      }, Number(frequency) * 1000)
    }
  }

  private paginationChange = (pageNo: number, pageSize: number, orders) => {
    const { onGetChartData, itemId, widget } = this.props
    let { pagination } = this.state
    const { nativeQuery } = this.state
    pagination = {
      ...pagination,
      pageNo,
      pageSize
    }
    onGetChartData('clear', itemId, widget.id, { pagination, nativeQuery, orders })
  }

  private dragOnStart = (e, data) => {
    e.stopPropagation()
    this.setState({
      mousePos: [e.pageX, e.pageY]
    })
    console.log('drag starts')
    return e.target !== data.node.lastElementChild
  }

  private dragOnStop = (e, data: IDeltaPosition) => {
    e.stopPropagation()
    const {
      itemId,
      onDragLayerStop } = this.props
    const { mousePos } = this.state
    if (mousePos[0] === e.pageX && mousePos[1] === e.pageY) {
      return
    }
    console.log('drag stops')
    onDragLayerStop(itemId, data)
  }

  private onDrag = (e, { deltaX, deltaY }: IDeltaPosition) => {
    e.stopPropagation()
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

  private onClickLayer = (e: React.MouseEvent<HTMLDivElement>) => {
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

    const { altKey, metaKey } = e
    const exclusive = !altKey && !metaKey
    onSelectLayer({ id: layer.id, selected: !selected, exclusive})
  }

  private toWorkbench = () => {
    const { itemId, widget, onEditWidget } = this.props
    onEditWidget(itemId, widget.id)
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
      model,
      datasource,
      loading,
      renderType,
      interactId,
      onCheckTableInteract,
      onDoTableInteract
    } = this.props
    const {
      layerParams,
      pagination,
      widgetProps } = this.state

    const layerClass = classnames({
      [styles.layer]: true,
      [styles.view]: !pure,
      [styles.selected]:  selected
    })

    const layerStyle = this.getLayerStyle(layer, layerParams)
    const isLoading = !pure && loading
    const data = datasource.resultList || []

    return (
      <div
        ref={(f) => this.refLayer = f}
        id={`layer_${layer.id}`}
        className={layerClass}
        style={layerStyle}
        onClick={this.onClickLayer}
      >
        {pure ? null : (
          <div className={styles.tools}>
            <Tooltip title="编辑">
              <Icon type="edit" onClick={this.toWorkbench} />
            </Tooltip>
          </div>
        )}
        {this.wrapLayerTooltip(
          (<Widget
            {...widgetProps}
            data={data}
            pagination={pagination}
            loading={isLoading}
            renderType={renderType}
            model={model}
            onPaginationChange={this.paginationChange}
          />)
        )}
      </div>
    )
  }

  private getLayerStyle = (layer, layerParams) => {
    const { pure } = this.props
    const {
      width, height,
      backgroundImage, backgroundRepeat, backgroundSize, backgroundColor,
      borderWidth, borderStyle, borderColor, borderRadius } = layerParams

    let layerStyle: React.CSSProperties = {
      width: `${width}px`,
      height: `${height}px`,
      zIndex: layer.index
    }

    if (borderWidth && borderStyle && borderColor) {
      layerStyle.border = `${borderWidth}px ${borderStyle} rgba(${borderColor.join()}`
    }
    if (borderRadius) {
      layerStyle.borderRadius = `${borderRadius}px`
    }
    if (backgroundImage) {
      layerStyle.background = `url("${backgroundImage}") 0% 0% / ${backgroundSize} ${backgroundRepeat}`
    } else if (backgroundColor) {
      layerStyle.backgroundColor = `rgba(${backgroundColor.join()})`
    }

    if (pure) {
      layerStyle = {
        ...layerStyle,
        position: 'absolute',
        left: `${layerParams.positionX}px`,
        top: `${layerParams.positionY}px`,
        width: `${width}px`,
        height: `${height}px`
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
      case SecondaryGraphTypes.Video:
        return this.renderVideoLayer(layer)
      case SecondaryGraphTypes.Timer:
        return this.renderTimerLayer(layer)
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
    const { pure, selected } = this.props

    const layerClass = classnames({
      [styles.layer]: true,
      [styles.view]: !pure,
      [styles.selected]: selected
    })
    const layerStyle = this.getLayerStyle(layer, layerParams)
    const {
      fontWeight,
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

    const labelStyle: React.CSSProperties = {
      wordBreak: 'break-all',
      overflow: 'hidden',
      fontWeight,
      fontFamily,
      color: `rgba(${fontColor.join()})`,
      fontSize: `${fontSize}px`,
      textAlign: textAlign as TextAlignProperty,
      lineHeight: `${lineHeight}px`,
      textIndent: `${textIndent}px`,
      paddingTop: `${paddingTop}px`,
      paddingRight: `${paddingRight}px`,
      paddingBottom: `${paddingBottom}px`,
      paddingLeft: `${paddingLeft}px`
    }
    if (textStyle) {
      labelStyle.fontStyle = textStyle.indexOf('italic') > -1 ? 'italic' : 'normal'
      labelStyle.textDecoration = textStyle.indexOf('underline') > -1 ? 'underline' : 'none'
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

  private renderVideoLayer = (layer) => {
    const { layerParams } = this.state
    const { src, controlSetting, start, end } = layerParams
    const { pure, selected } = this.props

    const layerClass = classnames({
      [styles.layer]: true,
      [styles.view]: !pure,
      [styles.selected]: selected
    })

    const layerStyle = this.getLayerStyle(layer, layerParams)

    const setting = controlSetting.reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {})

    return (
      <div
        ref={(f) => this.refLayer = f}
        className={layerClass}
        style={layerStyle}
        onClick={this.onClickLayer}
      >
        {this.wrapLayerTooltip(
          <Video
            key={`video_${layer.id}`}
            src={src}
            start={start}
            end={end}
            {...setting}
          />
        )}
      </div>
    )
  }


  private timer = null
  private renderTimerLayer = (layer) => {
    const { layerParams, currentTime } = this.state
    const { pure, selected } = this.props

    const layerClass = classnames({
      [styles.layer]: true,
      [styles.view]: !pure,
      [styles.selected]: selected
    })
    const layerStyle = this.getLayerStyle(layer, layerParams)
    const {
      fontWeight,
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
      paddingRight,

      timeFormat,
      timeDuration
    } = layerParams

    const labelStyle: React.CSSProperties = {
      wordBreak: 'break-all',
      overflow: 'hidden',
      fontWeight,
      fontFamily,
      color: `rgba(${fontColor.join()})`,
      fontSize: `${fontSize}px`,
      textAlign: textAlign as TextAlignProperty,
      lineHeight: `${lineHeight}px`,
      textIndent: `${textIndent}px`,
      paddingTop: `${paddingTop}px`,
      paddingRight: `${paddingRight}px`,
      paddingBottom: `${paddingBottom}px`,
      paddingLeft: `${paddingLeft}px`
    }
    if (textStyle) {
      labelStyle.fontStyle = textStyle.indexOf('italic') > -1 ? 'italic' : 'normal'
      labelStyle.textDecoration = textStyle.indexOf('underline') > -1 ? 'underline' : 'none'
    }
    if (this.timer) { clearInterval(this.timer) }
    this.timer = setInterval(() => {
      this.setState({
        currentTime: moment().format(timeFormat || 'YYYY-MM-dd HH:mm:ss')
      })
    }, timeDuration)
    return (
      <div
        ref={(f) => this.refLayer = f}
        className={layerClass}
        style={layerStyle}
        onClick={this.onClickLayer}
      >
        {this.wrapLayerTooltip(
          <p style={labelStyle}>
            {currentTime}
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

    const position = { x, y }

    const content = this.renderLayer(layer)
    if (pure) { return content }

    const maxConstraints: [number, number] = [slideParams.width - position.x, slideParams.height - position.y]

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
  polling: 'true' | 'false'
  positionX: number
  positionY: number
  width: number
  fontWeight: React.CSSProperties['fontWeight']
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

  src: string
  controlSetting: string[]
  start?: number
  end?: number

  timeFormat: string
  timeDuration: number
}

export interface IDeltaPosition {
  deltaX: number
  deltaY: number
}

export interface IDeltaSize {
  deltaWidth: number
  deltaHeight: number
}
export interface IBaseline {
  top: number
  right: number
  bottom: number
  left: number
  adjust: [number, number]
  adjustType: 'position' | 'size'
}

