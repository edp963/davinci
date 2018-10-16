/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import * as React from 'react'
import { fromJS } from 'immutable'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { createStructuredSelector } from 'reselect'
import { RouteComponentProps } from 'react-router'

import { compose } from 'redux'
import reducer from './reducer'
import saga from './sagas'
import reducerWidget from '../Widget/reducer'
import sagaWidget from '../Widget/sagas'
import reducerBizlogic from '../Bizlogic/reducer'
import sagaBizlogic from '../Bizlogic/sagas'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'

import {
  makeSelectCurrentDisplay,
  makeSelectCurrentSlide,
  makeSelectDisplays,
  makeSelectCurrentLayers,
  makeSelectCurrentLayersInfo,
  makeSelectCurrentLayersOperationInfo,
  makeSelectCurrentSelectedLayers,
  makeSelectClipboardLayers,
  makeSelectCanUndo,
  makeSelectCanRedo,
  makeSelectCurrentState,
  makeSelectNextState,
  makeSelectEditorBaselines } from './selectors'
import { slideSettings, GraphTypes } from './components/util'

import DisplayHeader from './components/DisplayHeader'
import DisplayBody from './components/DisplayBody'
import LayerList from './components/LayerList'
import DisplayContainer, { Keys } from './components/DisplayContainer'
import DisplayBottom from './components/DisplayBottom'
import DisplaySidebar from './components/DisplaySidebar'

import LayerItem, { ILayerParams } from './components/LayerItem'
import SettingForm from './components/SettingForm'
import DisplaySetting from './components/DisplaySetting'
import LayerAlign from './components/LayerAlign'

import { hideNavigator } from '../App/actions'
import { loadWidgets } from '../Widget/actions'
import {
  editCurrentDisplay,
  editCurrentSlide,
  uploadCurrentSlideCover,
  loadDisplayDetail,
  selectLayer,
  clearLayersSelection,
  dragSelectedLayer,
  resizeLayers,
  toggleLayersResizingStatus,
  toggleLayersDraggingStatus,
  addDisplayLayers,
  deleteDisplayLayers,
  editDisplayLayers,
  copySlideLayers,
  pasteSlideLayers,
  undoOperation,
  redoOperation,
  loadDisplayShareLink,
  showHorizontalBaseline,
  hideHorizontalBaseline,
  showVerticalBaseline,
  hideVerticalBaseline    } from './actions'
const message = require('antd/lib/message')
const styles = require('./Display.less')

import { IWidgetProps, RenderType } from '../Widget/components/Widget'
import { decodeMetricName } from '../Widget/components/util'
import {
  loadBizlogics,
  loadDataFromItem,
  loadCascadeSource, // TODO global filter in Display
  loadBizdataSchema  } from '../Bizlogic/actions'
import { makeSelectWidgets } from '../Widget/selectors'
import { makeSelectBizlogics } from '../Bizlogic/selectors'
import { GRID_ITEM_MARGIN } from '../../globalConstants'
// import { LayerContextMenu } from './components/LayerContextMenu'

import { ISlideParams } from './'

interface IParams {
  pid: number
  displayId: number
}

interface IEditorProps extends RouteComponentProps<{}, IParams> {
  widgets: any[]
  bizlogics: any[]
  currentDisplay: any
  currentSlide: any
  currentLayers: any[]
  currentLayersInfo: {
    [key: string]: {
      datasource: any[]
      loading: boolean
      queryParams: {
        filters: string
        linkageFilters: string
        globalFilters: string
        params: Array<{name: string, value: string}>
        linkageParams: Array<{name: string, value: string}>
        globalParams: Array<{name: string, value: string}>
      }
      interactId: string
      rendered: boolean
      renderType: RenderType
    }
  },
  currentLayersOperationInfo: {
    [key: string]: {
      selected: boolean
      resizing: boolean
      dragging: boolean
    }
  }
  clipboardLayers: any[]
  currentSelectedLayers: any[]
  canUndo: boolean
  canRedo: boolean
  currentState
  nextState
  editorBaselines: {
    horizontal: {
      visible: boolean,
      position: [number, number, number]
    },
    vertical: {
      visible: boolean,
      position: [number, number, number]
    }
  }
  onLoadWidgets: (projectId) => void
  onLoadBizlogics: (projectId, resolve?: any) => any
  onEditCurrentDisplay: (display: any, resolve?: any) => void
  onEditCurrentSlide: (displayId: number, slide: any, resolve?: any) => void
  onUploadCurrentSlideCover: (cover: Blob, resolve: any) => void
  onLoadDisplayDetail: (id: number) => void
  onSelectLayer: (obj: { id: any, selected: boolean, exclusive: boolean }) => void
  onClearLayersSelection: () => void
  onDragSelectedLayer: (id: number, deltaX: number, deltaY: number) => void
  onResizeLayers: (layerIds: number[]) => void
  toggleLayersResizingStatus: (layerIds: number[], resizing: boolean) => void
  toggleLayersDraggingStatus: (layerIds: number[], dragging: boolean) => void
  onAddDisplayLayers: (displayId: any, slideId: any, layers: any[]) => void
  onDeleteDisplayLayers: (displayId: any, slideId: any, ids: any[]) => void,
  onEditDisplayLayers: (displayId: any, slideId: any, layers: any[]) => void
  onCopySlideLayers: (slideId, layers) => void
  onPasteSlideLayers: (displayId, slideId, layers) => void
  onLoadDisplayShareLink: (id: number, authName: string) => void
  onUndo: (currentState) => void
  onRedo: (nextState) => void
  onHideNavigator: () => void
  onLoadDataFromItem: (
    renderType: RenderType,
    layerItemId: number,
    viewId: number,
    params: {
      groups: string[]
      aggregators: Array<{column: string, func: string}>
      filters: string[]
      linkageFilters: string[]
      globalFilters: string[]
      params: Array<{name: string, value: string}>
      linkageParams: Array<{name: string, value: string}>
      globalParams: Array<{name: string, value: string}>
      orders: Array<{column: string, direction: string}>
      cache: boolean
      expired: number
    }
  ) => void

  onShowHorizontalBaseline: (top, right, left) => void
  onHideHorizontalBaseline: () => void
  onShowVerticalBaseline: (top, bottom, left) => void
  onHideVerticalBaseline: () => void
}

interface IEditorStates {
  slideParams: Partial<ISlideParams>
  currentLocalLayers: any[]
  editorWidth: number
  editorHeight: number
  editorPadding: string
  scale: number
  sliderValue: number
}

export class Editor extends React.Component<IEditorProps, IEditorStates> {
  constructor (props) {
    super(props)

    this.state = {
      slideParams: {},
      currentLocalLayers: [],
      editorWidth: 0,
      editorHeight: 0,
      editorPadding: '',
      scale: 1,
      sliderValue: 20
    }

    this.refHandlers = {
      settingForm: (ref) => this.settingForm = ref,
      editor: (ref) => this.editor = ref
    }
  }

  private refHandlers: { settingForm: (ref: any) => void, editor: (ref: any) => void }
  private settingForm: any
  private editor: any
  private charts: object = {}

  public componentWillMount () {
    const {
      params,
      onLoadWidgets,
      onLoadBizlogics,
      onLoadDisplayDetail
    } = this.props
    const projectId = +params.pid
    const displayId = +params.displayId
    // onLoadBizlogics(projectId)
    onLoadDisplayDetail(displayId)
    onLoadWidgets(projectId)
  }

  public componentDidMount () {
    const {
      slideParams,
      scale
    } = this.state

    this.props.onHideNavigator()
    window.addEventListener('resize', this.containerResize, false)
    // onHideNavigator 导致页面渲染
  }

  public componentWillUnmount () {
    window.removeEventListener('resize', this.containerResize, false)
  }

  public componentWillReceiveProps (nextProps: IEditorProps) {
    const { currentSlide, currentLayers } = nextProps
    if (currentSlide !== this.props.currentSlide) {
      const { slideParams } = JSON.parse(currentSlide.config)
      this.setState({
        slideParams
      }, () => {
        this.doScale(1)
      })
    }
    if (currentLayers !== this.props.currentLayers) {
      const currentLocalLayers = fromJS(currentLayers).toJS()
      this.setState({
        currentLocalLayers
      })
    }
  }

  private containerResize = () => {
    this.sliderChange(this.state.sliderValue)
  }

  private sliderChange = (value) => {
    this.doScale(value / 40 + 0.5)
    this.setState({
      sliderValue: value
    })
  }

  private zoomIn = () => {
    if (this.state.sliderValue) {
      this.sliderChange(Math.max(this.state.sliderValue - 10, 0))
    }
  }

  private zoomOut = () => {
    if (this.state.sliderValue !== 100) {
      this.sliderChange(Math.min(this.state.sliderValue + 10, 100))
    }
  }

  private doScale = (times) => {
    const { slideParams } = this.state
    const { offsetWidth, offsetHeight } = this.editor.container

    const editorWidth = Math.max(offsetWidth * times, offsetWidth)
    const editorHeight = Math.max(offsetHeight * times, offsetHeight)

    let scale = (slideParams.width / slideParams.height > editorWidth / editorHeight) ?
      // landscape
      (editorWidth - 64) / slideParams.width * times :
      // portrait
      (editorHeight - 64) / slideParams.height * times
    scale = +(Math.floor(scale / 0.05) * 0.05).toFixed(2)

    const leftRightPadding = Math.max((offsetWidth - slideParams.width * scale) / 2, 32)
    const topBottomPadding = Math.max((offsetHeight - slideParams.height * scale) / 2, 32)

    this.setState({
      editorWidth: Math.max(editorWidth, slideParams.width * scale + 64),
      editorHeight: Math.max(editorHeight, slideParams.height * scale + 64),
      editorPadding: `${topBottomPadding}px ${leftRightPadding}px`,
      scale
    })
  }

  private displaySizeChange = (width, height) => {
    const { slideParams } = this.state
    this.setState({
      slideParams: {
        ...slideParams,
        width,
        height
      }
    }, () => {
      this.sliderChange(this.state.sliderValue)
    })
  }

  private getChartData = (renderType: RenderType, itemId: number, widgetId: number, queryParams?: any) => {
    const {
      currentLayersInfo,
      widgets,
      onLoadDataFromItem
    } = this.props

    const widget = widgets.find((w) => w.id === widgetId)
    const widgetConfig: IWidgetProps = JSON.parse(widget.config)
    const { cols, rows, metrics, filters, color, label, size, xAxis, tip, orders, cache, expired } = widgetConfig

    const cachedQueryParams = currentLayersInfo[itemId].queryParams
    let linkageFilters
    let globalFilters
    let params
    let linkageParams
    let globalParams

    if (queryParams) {
      linkageFilters = queryParams.linkageFilters !== undefined ? queryParams.linkageFilters : cachedQueryParams.linkageFilters
      globalFilters = queryParams.globalFilters !== undefined ? queryParams.globalFilters : cachedQueryParams.globalFilters
      params = queryParams.params || cachedQueryParams.params
      linkageParams = queryParams.linkageParams || cachedQueryParams.linkageParams
      globalParams = queryParams.globalParams || cachedQueryParams.globalParams
    } else {
      linkageFilters = cachedQueryParams.linkageFilters
      globalFilters = cachedQueryParams.globalFilters
      params = cachedQueryParams.params
      linkageParams = cachedQueryParams.linkageParams
      globalParams = cachedQueryParams.globalParams
    }

    let groups = cols.concat(rows).filter((g) => g !== '指标名称')
    let aggregators =  metrics.map((m) => ({
      column: decodeMetricName(m.name),
      func: m.agg
    }))

    if (color) {
      groups = groups.concat(color.items.map((c) => c.name))
    }
    if (label) {
      groups = groups.concat(label.items
        .filter((l) => l.type === 'category')
        .map((l) => l.name))
      aggregators = aggregators.concat(label.items
        .filter((l) => l.type === 'value')
        .map((l) => ({
          column: decodeMetricName(l.name),
          func: l.agg
        })))
    }
    if (size) {
      aggregators = aggregators.concat(size.items
        .map((s) => ({
          column: decodeMetricName(s.name),
          func: s.agg
        })))
    }
    if (xAxis) {
      aggregators = aggregators.concat(xAxis.items
        .map((l) => ({
          column: decodeMetricName(l.name),
          func: l.agg
        })))
    }
    if (tip) {
      aggregators = aggregators.concat(tip.items
        .map((t) => ({
          column: decodeMetricName(t.name),
          func: t.agg
        })))
    }

    onLoadDataFromItem(
      renderType,
      itemId,
      widget.viewId,
      {
        groups,
        aggregators,
        filters: filters.map((i) => i.config.sql),
        linkageFilters,
        globalFilters,
        params,
        linkageParams,
        globalParams,
        orders,
        cache,
        expired
      }
    )
  }

  private updateCurrentLocalLayers = (
    itemId: number,
    { deltaX, deltaY, deltaWidth, deltaHeight }: { deltaX: number, deltaY: number, deltaWidth: number, deltaHeight: number }
  ) => {
    const editLayers = []
    const { currentLayersOperationInfo } = this.props
    const { currentLocalLayers, slideParams } = this.state
    const copyCurrentLocalLayers = fromJS(currentLocalLayers).toJS()

    editLayers.push(copyCurrentLocalLayers.find((localLayer) => localLayer.id === itemId))
    if (editLayers[0].selected) {
      editLayers.splice(0, 1, ...copyCurrentLocalLayers.filter((localLayer) => currentLayersOperationInfo[localLayer.id].selected))
    }

    const mapLayerParams: { [layerId: number]: ILayerParams } = editLayers.reduce((acc, layer) => {
      acc[layer.id] = JSON.parse(layer.params)
      return acc
    }, {})

    const minX = editLayers.reduce((min, layer) => Math.min(min, mapLayerParams[layer.id].positionX), Infinity)
    const maxX = editLayers.reduce((max, layer) => {
      const { positionX, width } = mapLayerParams[layer.id]
      return Math.max(max, positionX + width)
    }, -Infinity)

    const minY = editLayers.reduce((min, layer) => Math.min(min, mapLayerParams[layer.id].positionY), Infinity)
    const maxY = editLayers.reduce((max, layer) => {
      const { positionY, height } = mapLayerParams[layer.id]
      return Math.max(max, positionY + height)
    }, -Infinity)

    const middleX = Math.round((minX + maxX) / 2)
    const middleY = Math.round((minY + maxY) / 2)

    const { width: slideWidth, height: slideHeight } = slideParams
    const { onShowHorizontalBaseline, onHideHorizontalBaseline, onShowVerticalBaseline, onHideVerticalBaseline } = this.props
    if (Math.abs(slideWidth / 2 - middleX) < GRID_ITEM_MARGIN) {
      onShowVerticalBaseline(0, 0, slideWidth / 2)
      // deltaX = 0
    } else {
      onHideVerticalBaseline()
    }
    if (Math.abs(slideHeight / 2 - middleY) < GRID_ITEM_MARGIN) {
      onShowHorizontalBaseline(slideHeight / 2, 0, 0)
      // deltaY = 0
    } else {
      onHideHorizontalBaseline()
    }

    editLayers.forEach((localLayer) => {
      const layerParams = JSON.parse(localLayer.params)
      const { positionX, positionY, width, height } = layerParams
      localLayer.params = JSON.stringify({
        ...layerParams,
        positionX: Math.round(positionX + deltaX),
        positionY: Math.round(positionY + deltaY),
        width: Math.round(width + deltaWidth),
        height: Math.round(height + deltaHeight)
      })
    })

    this.setState({ currentLocalLayers: copyCurrentLocalLayers })
    return editLayers
  }

  private dragLayer = (itemId, delta) => {
    const editLayers = this.updateCurrentLocalLayers(itemId, {
      ...delta,
      deltaWidth: 0,
      deltaHeight: 0
    })
    this.props.toggleLayersDraggingStatus(editLayers.map((l) => l.id), true)
  }

  private dragLayerStop = (itemId, delta) => {
    const editLayers = this.updateCurrentLocalLayers(itemId, {
      ...delta,
      deltaWidth: 0,
      deltaHeight: 0
    })
    this.onEditLayers(editLayers)
    const { onHideHorizontalBaseline, onHideVerticalBaseline, toggleLayersDraggingStatus } = this.props
    toggleLayersDraggingStatus(editLayers.map((l) => l.id), false)
    onHideHorizontalBaseline()
    onHideVerticalBaseline()
  }

  private resizeLayer = (itemId, delta) => {
    const editLayers = this.updateCurrentLocalLayers(itemId, {
      ...delta,
      deltaX: 0,
      deltaY: 0
    })
    this.props.toggleLayersResizingStatus(editLayers.map((l) => l.id), true)
  }

  private resizeLayerStop = (itemId, delta) => {
    const { onResizeLayers } = this.props
    const editLayers = this.updateCurrentLocalLayers(itemId, {
      ...delta,
      deltaX: 0,
      deltaY: 0
    })
    this.onEditLayers(editLayers)
    onResizeLayers(editLayers.map((layer) => layer.id))
    this.props.toggleLayersResizingStatus(editLayers.map((l) => l.id), false)
  }

  private formItemChange = (field, val) => {
    const { slideParams } = this.state

    const {
      currentDisplay,
      currentSlide,
      currentSelectedLayers,
      onEditCurrentSlide } = this.props

    if (currentSelectedLayers.length === 1) {
      const selectedLayer = currentSelectedLayers[0]
      const layerParams = {
        ...JSON.parse(selectedLayer['params']),
        [field]: val
      }
      this.onEditLayers([{
        ...selectedLayer,
        params: JSON.stringify(layerParams)
      }])
    } else {
      const newSlideParams = {
        ...slideParams,
        [field]: val
      }
      const newConfig = {
        ...JSON.parse(currentSlide.config),
        slideParams: newSlideParams
      }
      onEditCurrentSlide(currentDisplay.id, {
        ...currentSlide,
        config: JSON.stringify(newConfig)
      })
    }
  }

  private getSettingInfo = () => {
    const { currentSlide, currentSelectedLayers } = this.props
    const { slideParams } = this.state

    if (currentSelectedLayers.length === 1) {
      const selectedLayer = currentSelectedLayers[0]
      const type = selectedLayer.subType || selectedLayer.type
      return {
        key: `layer_${selectedLayer.id}`,
        id: selectedLayer.id,
        setting: slideSettings[type],
        param: JSON.parse(selectedLayer['params'])
      }
    }
    return {
      key: 'slide',
      id: currentSlide.id,
      setting: slideSettings[GraphTypes.Slide],
      param: slideParams
    }
  }

  private deleteLayers = () => {
    const { currentDisplay, currentSlide, currentLayersOperationInfo } = this.props
    const ids = Object.keys(currentLayersOperationInfo).filter((id) => currentLayersOperationInfo[id].selected)
    if (ids.length <= 0) {
      message.warning('请选择图层')
      return
    }
    this.props.onDeleteDisplayLayers(currentDisplay.id, currentSlide.id, ids)
  }

  private onEditLayers = (layers) => {
    const { currentDisplay, currentSlide, onEditDisplayLayers } = this.props
    onEditDisplayLayers(currentDisplay.id, currentSlide.id, layers)
  }

  private addLayers = (layers: any[]) => {
    if (!Array.isArray(layers)) { return }

    const {
      currentDisplay,
      currentSlide,
      currentLayers,
      onAddDisplayLayers
    } = this.props
    const { slideParams } = this.state
    let maxLayerIndex = currentLayers.length === 0 ?
      0 :
      currentLayers.reduce((acc, layer) => Math.max(acc, layer.index), -Infinity)
    layers.forEach((layer) => {
      layer.index = ++maxLayerIndex
      layer.displaySlideId = currentSlide.id
      layer['params'] = JSON.stringify({
        ...JSON.parse(layer['params']),
        width: (slideParams.width - GRID_ITEM_MARGIN * 5) / 4,
        height: (slideParams.height - GRID_ITEM_MARGIN * 5) / 4,
        positionX: GRID_ITEM_MARGIN,
        positionY: GRID_ITEM_MARGIN
      })
    })
    onAddDisplayLayers(currentDisplay.id, currentSlide.id, layers)
  }

  private copyLayers = () => {
    const { currentSlide, currentSelectedLayers, onCopySlideLayers } = this.props
    if (!currentSelectedLayers.length) {
      message.warning('请选择图层')
      return
    }
    const { slideParams } = this.state
    const copyLayers = currentSelectedLayers.map((layer) => {
      const layerParams = JSON.parse(layer.params)
      const { positionX, positionY } = layerParams
      return {
        ...layer,
        params: JSON.stringify({
          ...layerParams,
          positionX: positionX + GRID_ITEM_MARGIN,
          positionY: positionY + GRID_ITEM_MARGIN
        }),
        id: null
      }
    })
    onCopySlideLayers(currentSlide.id, copyLayers)
  }

  private pasteLayers = () => {
    const { currentDisplay, currentSlide, clipboardLayers, onPasteSlideLayers } = this.props
    if (!clipboardLayers.length) { return }
    onPasteSlideLayers(currentDisplay.id, currentSlide.id, clipboardLayers)
  }

  private coverCut = () => {
    this.editor.createCoverCut()
  }

  private coverCutCreated = (blob) => {
    const { currentDisplay, currentSlide, onUploadCurrentSlideCover, onEditCurrentDisplay } = this.props
    onUploadCurrentSlideCover(blob, (avatar) => {
      onEditCurrentDisplay({
        ...currentDisplay,
        avatar
      })
    })
  }

  private coverUploaded = (avatar) => {
    const { onEditCurrentDisplay, currentDisplay } = this.props
    onEditCurrentDisplay({
      ...currentDisplay,
      avatar
    })
  }

  private collapseChange = () => {
    const { sliderValue } = this.state
    this.doScale(sliderValue / 40 + 0.5)
  }

  private keyDown = (key: Keys) => {
    const { slideParams } = this.state
    switch (key) {
      case Keys.Up:
        this.moveSelectedLayersPosition({ positionXD: 0, positionYD: - GRID_ITEM_MARGIN })
        break
      case Keys.Down:
        this.moveSelectedLayersPosition({ positionXD: 0, positionYD: GRID_ITEM_MARGIN })
        break
      case Keys.Left:
        this.moveSelectedLayersPosition({ positionXD: - GRID_ITEM_MARGIN, positionYD: 0 })
        break
      case Keys.Right:
        this.moveSelectedLayersPosition({ positionXD: GRID_ITEM_MARGIN, positionYD: 0 })
        break
      case Keys.Delete:
        this.deleteLayers()
        break
      case Keys.Copy:
        this.copyLayers()
        break
      case Keys.Paste:
        this.pasteLayers()
        break
      case Keys.UnDo:
        this.undo()
        break
      case Keys.Redo:
        this.redo()
        break
    }
  }

  private moveSelectedLayersPosition = (direction: { positionXD: number, positionYD: number }) => {
    const { currentSelectedLayers } = this.props
    if (currentSelectedLayers.length <= 0) { return }
    const { positionXD, positionYD } = direction
    const { currentDisplay, currentSlide, onEditDisplayLayers } = this.props
    const layers = currentSelectedLayers.map((layer) => {
      const layerParams = JSON.parse(layer.params)
      const { positionX, positionY } = layerParams
      return {
        ...layer,
        params: JSON.stringify({
          ...layerParams,
          positionX: positionX - positionX % GRID_ITEM_MARGIN + positionXD,
          positionY: positionY - positionY % GRID_ITEM_MARGIN + positionYD
        })
      }
    })
    onEditDisplayLayers(currentDisplay.id, currentSlide.id, layers)
  }

  private undo = () => {
    const { onUndo, currentState } = this.props
    onUndo(currentState)
  }

  private redo = () => {
    const { onRedo, nextState } = this.props
    onRedo(nextState)
  }

  private layersSelectionRemove = () => {
    const { onClearLayersSelection } = this.props
    onClearLayersSelection()
  }

  private getEditorBaselines = () => {
    const { scale } = this.state
    const { editorBaselines } = this.props
    const { horizontal, vertical } = editorBaselines
    const [ hTop, hRight, hLeft ] = horizontal.position
    const [ vTop, vBottom, vLeft ] = vertical.position

    const styleHorizontal: React.CSSProperties = {
      display: horizontal.visible ? 'block' : 'none',
      height: `${1 / scale}px`,
      top: `${hTop}px`,
      right: `${hRight}px`,
      left: `${hLeft}px`
    }
    const styleVertical: React.CSSProperties = {
      display: vertical.visible ? 'block' : 'none',
      width: `${1 / scale}px`,
      top: `${vTop}px`,
      bottom: `${vBottom}px`,
      left: `${vLeft}px`
    }
    const baselines = [
      (<div key="horizontalBaseline" className={styles.horizontalBaseline} style={styleHorizontal} />),
      (<div key="verticalBaseline" className={styles.verticalBaseline} style={styleVertical} />)
    ]

    return baselines
  }

  public render () {
    const {
      params,
      currentLayersInfo,
      currentLayersOperationInfo,
      currentSelectedLayers,
      widgets,
      currentDisplay,
      onSelectLayer,
      onLoadDisplayShareLink,
      canUndo,
      canRedo
    } = this.props

    const {
      slideParams,
      currentLocalLayers,
      editorWidth,
      editorHeight,
      editorPadding,
      scale,
      sliderValue
    } = this.state

    if (!currentDisplay) { return null }

    const layerItems =  !Array.isArray(widgets) ? null : currentLocalLayers.map((layer, idx) => {
      const widget = widgets.find((w) => w.id === layer.widgetId)
      const layerId = layer.id

      const { polling, frequency } = JSON.parse(layer.params)
      const { datasource, loading, interactId, rendered, renderType } = currentLayersInfo[layerId]
      const { selected, resizing, dragging } = currentLayersOperationInfo[layerId]

      return (
        // <LayerContextMenu key={layer.id}>
        <LayerItem
          key={layer.id}
          pure={false}
          scale={[scale, scale]}
          slideParams={slideParams}
          layer={layer}
          selected={selected}
          resizing={resizing}
          dragging={dragging}
          itemId={layerId}
          widget={widget}
          data={datasource}
          loading={loading}
          polling={polling}
          frequency={frequency}
          interactId={interactId}
          rendered={rendered}
          renderType={renderType}
          onSelectLayer={onSelectLayer}
          onGetChartData={this.getChartData}
          onDragLayer={this.dragLayer}
          onResizeLayer={this.resizeLayer}
          onResizeLayerStop={this.resizeLayerStop}
          onDragLayerStop={this.dragLayerStop}
        />
        // </LayerContextMenu>
      )
    })

    const baselines = this.getEditorBaselines()

    const settingInfo = this.getSettingInfo()

    let settingContent = null
    if (currentSelectedLayers.length > 1) {
      settingContent = (
        <LayerAlign
          layers={currentSelectedLayers}
          onEditDisplayLayers={this.onEditLayers}
          onCollapseChange={this.collapseChange}
        />
      )
    } else {
      settingContent = (
        <SettingForm
          key={settingInfo.key}
          id={settingInfo.id}
          settingInfo={settingInfo.setting}
          settingParams={settingInfo.param}
          onDisplaySizeChange={this.displaySizeChange}
          onFormItemChange={this.formItemChange}
          wrappedComponentRef={this.refHandlers.settingForm}
          onCollapseChange={this.collapseChange}
        >
          {currentSelectedLayers.length === 0 ? (
            <DisplaySetting
              key="displaySetting"
              display={currentDisplay}
              onCoverCut={this.coverCut}
              onCoverUploaded={this.coverUploaded}
            />
          ) : null}
        </SettingForm>
      )
    }

    return (
      <div className={`${styles.preview} ${styles.edit}`}>
        <Helmet title={currentDisplay.name} />
        <DisplayHeader
          display={currentDisplay}
          widgets={widgets}
          params={params}
          onAddLayers={this.addLayers}
          onDeleteLayers={this.deleteLayers}
          onCopyLayers={this.copyLayers}
          onPasteLayers={this.pasteLayers}
          onLoadDisplayShareLink={onLoadDisplayShareLink}
          onUndo={this.undo}
          onRedo={this.redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        <DisplayBody>
          <DisplayContainer
            key="editor"
            width={editorWidth}
            height={editorHeight}
            padding={editorPadding}
            slideParams={slideParams}
            scale={scale}
            onCoverCutCreated={this.coverCutCreated}
            onKeyDown={this.keyDown}
            onLayersSelectionRemove={this.layersSelectionRemove}
            ref={this.refHandlers.editor}
          >
            {[...baselines, ...layerItems]}
          </DisplayContainer>
          <DisplayBottom
            scale={scale}
            sliderValue={sliderValue}
            onZoomIn={this.zoomIn}
            onZoomOut={this.zoomOut}
            onSliderChange={this.sliderChange}
          />
          <DisplaySidebar>
            <LayerList
              layers={currentLocalLayers}
              layersStatus={currentLayersOperationInfo}
              selectedLayers={currentSelectedLayers}
              onSelectLayer={onSelectLayer}
              onEditDisplayLayers={this.onEditLayers}
              onCollapseChange={this.collapseChange}
            />
            {settingContent}
          </DisplaySidebar>
        </DisplayBody>
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  widgets: makeSelectWidgets(),
  bizlogics: makeSelectBizlogics(),
  displays: makeSelectDisplays(),
  currentDisplay: makeSelectCurrentDisplay(),
  currentSlide: makeSelectCurrentSlide(),
  currentLayers: makeSelectCurrentLayers(),
  currentLayersInfo: makeSelectCurrentLayersInfo(),
  currentLayersOperationInfo: makeSelectCurrentLayersOperationInfo(),
  clipboardLayers: makeSelectClipboardLayers(),
  currentSelectedLayers: makeSelectCurrentSelectedLayers(),
  canUndo: makeSelectCanUndo(),
  canRedo: makeSelectCanRedo(),
  currentState: makeSelectCurrentState(),
  nextState: makeSelectNextState(),
  editorBaselines: makeSelectEditorBaselines()
})

function mapDispatchToProps (dispatch) {
  return {
    onLoadDisplayDetail: (id) => dispatch(loadDisplayDetail(id)),
    onLoadWidgets: (projectId) => dispatch(loadWidgets(projectId)),
    onLoadBizlogics: (projectId, resolve) => dispatch(loadBizlogics(projectId, resolve)),
    onEditCurrentDisplay: (display, resolve?) => dispatch(editCurrentDisplay(display, resolve)),
    onEditCurrentSlide: (displayId, slide, resolve?) => dispatch(editCurrentSlide(displayId, slide, resolve)),
    onUploadCurrentSlideCover: (cover, resolve) => dispatch(uploadCurrentSlideCover(cover, resolve)),
    onLoadDataFromItem: (renderType, itemId, viewId, params) => dispatch(loadDataFromItem(renderType, itemId, viewId, params, 'display')),
    onSelectLayer: ({ id, selected, exclusive }) => dispatch(selectLayer({ id, selected, exclusive })),
    onClearLayersSelection: () => dispatch(clearLayersSelection()),
    onDragSelectedLayer: (id, deltaX, deltaY) => dispatch(dragSelectedLayer({ id, deltaX, deltaY })),
    onResizeLayers: (layerIds) => dispatch(resizeLayers(layerIds)),
    toggleLayersResizingStatus: (layerIds, resizing) => dispatch(toggleLayersResizingStatus(layerIds, resizing)),
    toggleLayersDraggingStatus: (layerIds, dragging) => dispatch(toggleLayersDraggingStatus(layerIds, dragging)),
    onAddDisplayLayers: (displayId, slideId, layers) => dispatch(addDisplayLayers(displayId, slideId, layers)),
    onDeleteDisplayLayers: (displayId, slideId, ids) => dispatch(deleteDisplayLayers(displayId, slideId, ids)),
    onEditDisplayLayers: (displayId, slideId, layers) => dispatch(editDisplayLayers(displayId, slideId, layers)),
    onCopySlideLayers: (slideId, layers) => dispatch(copySlideLayers(slideId, layers)),
    onPasteSlideLayers: (displayId, slideId, layers) => dispatch(pasteSlideLayers(displayId, slideId, layers)),
    onLoadDisplayShareLink: (id, authName) => dispatch(loadDisplayShareLink(id, authName)),
    onUndo: (currentState) => dispatch(undoOperation(currentState)),
    onRedo: (nextState) => dispatch(redoOperation(nextState)),
    onHideNavigator: () => dispatch(hideNavigator()),

    onShowHorizontalBaseline: (top, right, left) => dispatch(showHorizontalBaseline(top, right, left)),
    onHideHorizontalBaseline: () => dispatch(hideHorizontalBaseline()),
    onShowVerticalBaseline: (top, bottom, left) => dispatch(showVerticalBaseline(top, bottom, left)),
    onHideVerticalBaseline: () => dispatch(hideVerticalBaseline())
  }
}

const withConnect = connect<{}, {}, IEditorProps>(mapStateToProps, mapDispatchToProps)

const withReducer = injectReducer({ key: 'display', reducer })
const withSaga = injectSaga({ key: 'display', saga })

const withReducerWidget = injectReducer({ key: 'widget', reducer: reducerWidget })
const withSagaWidget = injectSaga({ key: 'widget', saga: sagaWidget })

const withReducerBizlogic = injectReducer({ key: 'bizlogic', reducer: reducerBizlogic })
const withSagaBizlogic = injectSaga({ key: 'bizlogic', saga: sagaBizlogic })

export default compose(
  withReducer,
  withReducerWidget,
  withReducerBizlogic,
  withSaga,
  withSagaWidget,
  withSagaBizlogic,
  withConnect)(Editor)
