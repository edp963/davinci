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
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import * as echarts from 'echarts/lib/echarts'
import { createStructuredSelector } from 'reselect'

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
  makeSelectCurrentLayersStatus,
  makeSelectCurrentSelectedLayers,
  makeSelectCurrentLayersLoading,
  makeSelectCurrentDatasources,
  makeSelectCurrentLayersQueryParams } from './selectors'
import { makeSelectLoginUser } from '../../containers/App/selectors'
import { echartsOptionsGenerator } from '../Widget/components/chartUtil'
import slideSettings from '../../assets/json/slideSettings'

import DisplayHeader from './components/DisplayHeader'
import DisplayBody from './components/DisplayBody'
import LayerList from './components/LayerList'
import DisplayContainer from './components/DisplayContainer'
import DisplayBottom from './components/DisplayBottom'
import DisplaySidebar from './components/DisplaySidebar'

import LayerItem from './components/LayerItem'
import SettingForm from './components/SettingForm'
import DisplaySetting from './components/DisplaySetting'

import { hideNavigator } from '../App/actions'
import { loadWidgets } from '../Widget/actions'
import {
  editCurrentDisplay,
  editCurrentSlide,
  uploadCurrentSlideCover,
  loadDisplayDetail,
  selectLayer,
  addDisplayLayers,
  deleteDisplayLayers,
  editDisplayLayers } from './actions'
import {
  DEFAULT_DISPLAY_WIDTH,
  DEFAULT_DISPLAY_HEIGHT,
  DEFAULT_DISPLAY_GRID_DISTANCE,
  DEFAULT_DISPLAY_SCALE,
  DEFAULT_DISPLAY_SCALE_MODE,
  ECHARTS_RENDERER,
  DEFAULT_PRIMARY_COLOR } from '../../globalConstants'
import widgetlibs from '../../assets/json/widgetlib'
const styles = require('./Display.less')

import {
  loadBizlogics,
  loadBizdatasFromItem,
  loadCascadeSourceFromItem,
  loadCascadeSourceFromDashboard,
  loadBizdataSchema  } from '../Bizlogic/actions'
import { makeSelectWidgets } from '../Widget/selectors'
import { makeSelectBizlogics } from '../Bizlogic/selectors'
import { GraphTypes } from 'utils/util'

interface IEditorProps {
  params: any
  loginUser: any
  widgets: any[]
  bizlogics: any[]
  currentDisplay: any
  currentSlide: any
  currentLayers: any[]
  currentLayersStatus: object
  currentSelectedLayers: any[]
  currentDatasources: object
  currentLayersLoading: object
  currentLayersQueryParams: object
  onLoadWidgets: () => void
  onLoadBizlogics: () => any
  onEditCurrentDisplay: (display: any, resolve?: any) => void
  onEditCurrentSlide: (displayId: number, slide: any, resolve?: any) => void
  onUploadCurrentSlideCover: (cover: Blob, resolve: any) => void
  onLoadDisplayDetail: (id: number) => void
  onSelectLayer: (obj: { id: any, selected: boolean, exclusive: boolean }) => void
  onAddDisplayLayers: (displayId: any, slideId: any, layers: any[]) => void
  onDeleteDisplayLayers: (displayId: any, slideId: any, ids: any[]) => void,
  onEditDisplayLayers: (displayId: any, slideId: any, layers: any[]) => void
  onHideNavigator: () => void,
  onLoadBizdatasFromItem: (
    dashboardItemId: number,
    flatTableId: number,
    sql: {
      adHoc: string
      filters: string
      linkageFilters: string
      globalFilters: string
      params: any[]
      linkageParams: any[]
      globalParams: any[]
    },
    sorts: string,
    offset: number,
    limit: number,
    useCache: string,
    expired: number
  ) => void
}

interface IEditorStates {
  slideParams: any,
  editorWidth: number,
  editorHeight: number,
  editorPadding: string,
  scale: number,
  sliderValue: number
  triggerType: string
}

export class Editor extends React.Component<IEditorProps, IEditorStates> {
  constructor (props) {
    super(props)

    this.state = {
      slideParams: {},
      editorWidth: 0,
      editorHeight: 0,
      editorPadding: '',
      scale: 1,
      sliderValue: 20,
      triggerType: 'manual'
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
    const displayId = +params.displayId
    onLoadBizlogics()
    onLoadDisplayDetail(displayId)
    onLoadWidgets()
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
    const { currentSlide } = nextProps
    if (currentSlide !== this.props.currentSlide) {
      const { slideParams } = JSON.parse(currentSlide.config)
      this.setState({
        slideParams
      }, () => {
        this.doScale(1)
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

    console.log(scale)
    console.log({
      editorWidth: Math.max(editorWidth, slideParams.width * scale + 64),
      editorHeight: Math.max(editorHeight, slideParams.height * scale + 64),
      editorPadding: `${topBottomPadding}px ${leftRightPadding}px`
    })

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

  private gridDistanceChange = (gridDistance) => {
    const { slideParams } = this.state
    this.setState({
      slideParams: {
        ...slideParams,
        gridDistance
      }
    })
  }

  private getChartData = (renderType: string, itemId: number, widgetId: number, queryParams?: any) => {
    const {
      widgets,
      currentLayers,
      currentLayersQueryParams,
      onLoadBizdatasFromItem
    } = this.props
    const widget = widgets.find((w) => w.id === widgetId)
    const chartInfo = widgetlibs.find((wl) => wl.id === widget.widgetlib_id)
    const chartInstanceId = `widget_${itemId}`

    const widgetConfig = JSON.parse(widget.config)
    let currentChart = this.charts[chartInstanceId]

    if (chartInfo.renderer === ECHARTS_RENDERER) {
      switch (renderType) {
        case 'rerender':
          if (currentChart) {
            currentChart.dispose()
          }
          currentChart = echarts.init(document.getElementById(chartInstanceId) as HTMLDivElement, 'default')
          this.charts[chartInstanceId] = currentChart
          currentChart.showLoading('default', { color: DEFAULT_PRIMARY_COLOR })
          break
        case 'clear':
          currentChart.clear()
          currentChart.showLoading('default', { color: DEFAULT_PRIMARY_COLOR })
          break
        case 'refresh':
          currentChart.showLoading('default', { color: DEFAULT_PRIMARY_COLOR })
          break
        default:
          break
      }
    }

    const cachedQueryParams = currentLayersQueryParams[itemId]

    let filters
    let linkageFilters
    let globalFilters
    let params
    let linkageParams
    let globalParams
    let pagination

    if (queryParams) {
      filters = queryParams.filters !== undefined ? queryParams.filters : cachedQueryParams.filters
      linkageFilters = queryParams.linkageFilters !== undefined ? queryParams.linkageFilters : cachedQueryParams.linkageFilters
      globalFilters = queryParams.globalFilters !== undefined ? queryParams.globalFilters : cachedQueryParams.globalFilters
      params = queryParams.params || cachedQueryParams.params
      linkageParams = queryParams.linkageParams || cachedQueryParams.linkageParams
      globalParams = queryParams.globalParams || cachedQueryParams.globalParams
      pagination = queryParams.pagination || cachedQueryParams.pagination
    } else {
      filters = cachedQueryParams.filters
      linkageFilters = cachedQueryParams.linkageFilters
      globalFilters = cachedQueryParams.globalFilters
      params = cachedQueryParams.params
      linkageParams = cachedQueryParams.linkageParams
      globalParams = cachedQueryParams.globalParams
      pagination = cachedQueryParams.pagination
    }

    onLoadBizdatasFromItem(
      itemId,
      widget.flatTable_id,
      {
        adHoc: widget.adhoc_sql,
        filters,
        linkageFilters,
        globalFilters,
        params,
        linkageParams,
        globalParams
      },
      pagination.sorts,
      pagination.offset,
      pagination.limit,
      widgetConfig.useCache,
      widgetConfig.expired
    )
  }

  private resizeLayerStop = (layer: any, size: any, itemId: any) => {
    const layerParams = {
      ...JSON.parse(layer.params),
      ...size
    }
    this.onEditLayers([{
      ...layer,
      params: JSON.stringify(layerParams)
    }])
    const chartInstance = this.charts[`widget_${itemId}`]
    if (chartInstance) { chartInstance.resize() }
  }

  private renderChart = (itemId, widget, dataSource, chartInfo, interactIndex?): void => {
    const chartInstance = this.charts[`widget_${itemId}`]

    echartsOptionsGenerator({
      dataSource,
      chartInfo,
      chartParams: {
        id: widget.id,
        name: widget.name,
        desc: widget.desc,
        flatTable_id: widget.flatTable_id,
        widgetlib_id: widget.widgetlib_id,
        ...JSON.parse(widget.chart_params)
      },
      interactIndex
    })
      .then((chartOptions) => {
        chartInstance.setOption(chartOptions)
        // this.registerChartInteractListener(chartInstance, itemId)
        chartInstance.hideLoading()
      })
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
    const { currentSelectedLayers } = this.props
    const { slideParams } = this.state

    if (currentSelectedLayers.length === 1) {
      const selectedLayer = currentSelectedLayers[0]
      const type = selectedLayer.subType || selectedLayer.type
      return {
        key: `layer_${selectedLayer.id}`,
        setting: slideSettings[type],
        param: JSON.parse(selectedLayer['params'])
      }
      // this.settingForm.props.form.setFieldsValue(JSON.parse(selectedLayer['layer_params']))
    }
    // this.settingForm.props.form.setFieldsValue({ ...displayParams })
    return {
      key: 'slide',
      setting: slideSettings[GraphTypes.Slide],
      param: slideParams
    }
  }

  private onDeleteLayers = (ids) => {
    const { currentDisplay, currentSlide } = this.props
    this.props.onDeleteDisplayLayers(currentDisplay.id, currentSlide.id, ids)
  }

  private onEditLayers = (layers) => {
    const { currentDisplay, currentSlide, onEditDisplayLayers } = this.props
    onEditDisplayLayers(currentDisplay.id, currentSlide.id, layers)
  }

  private onAddLayers = (layers: any[]) => {
    if (!Array.isArray(layers)) { return }

    const {
      currentDisplay,
      currentSlide,
      currentLayers,
      onAddDisplayLayers
    } = this.props
    const { slideParams } = this.state
    const { gridDistance } = slideParams
    let maxLayerIndex = currentLayers.length === 0 ?
      0 :
      currentLayers.reduce((acc, layer) => Math.max(acc, layer.index), -Infinity)
    layers.forEach((layer) => {
      layer.index = ++maxLayerIndex
      layer.displaySlideId = currentSlide.id
      layer['params'] = JSON.stringify({
        ...JSON.parse(layer['params']),
        width: (slideParams.width - slideParams.gridDistance * 5) / 4,
        height: (slideParams.height - slideParams.gridDistance * 5) / 4,
        positionX: gridDistance,
        positionY: gridDistance
      })
    })
    onAddDisplayLayers(currentDisplay.id, currentSlide.id, layers)
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

  public render () {
    const {
      params,
      loginUser,
      currentLayersStatus,
      currentLayersLoading,
      currentSelectedLayers,
      currentLayersQueryParams,
      currentDatasources,
      widgets,
      currentDisplay,
      currentSlide,
      currentLayers,
      onSelectLayer
    } = this.props

    const {
      slideParams,
      editorWidth,
      editorHeight,
      editorPadding,
      scale,
      sliderValue
    } = this.state

    if (!currentDisplay) { return null }

    const layerItems =  !Array.isArray(widgets) ? null : currentLayers.map((layer, idx) => {
      const widget = widgets.find((w) => w.id === layer.widgetId)
      const chartInfo = widget && widgetlibs.find((wl) => wl.id === widget.widgetlib_id)
      const layerId = layer.id
      const data = currentDatasources[layerId]
      const loading = currentLayersLoading[layerId]
      const sql = currentLayersQueryParams[layerId]

      return (
        <LayerItem
          pure={false}
          ref={(f) => this[`layerId_${layer.id}`]}
          itemId={layerId}
          widget={widget}
          chartInfo={chartInfo}
          data={data}
          key={layer.id}
          scale={scale}
          slideParams={slideParams}
          layer={layer}
          loading={loading}
          layersStatus={currentLayersStatus}
          onSelectLayer={onSelectLayer}
          onGetChartData={this.getChartData}
          onRenderChart={this.renderChart}
          onResizeLayerStop={this.resizeLayerStop}
        />
      )
    })

    const settingInfo = this.getSettingInfo()

    return (
      <div className={`${styles.preview} ${styles.edit}`}>
        <Helmet title={currentDisplay.name} />
        <DisplayHeader
          display={currentDisplay}
          widgets={widgets}
          params={params}
          currentLayersStatus={currentLayersStatus}
          loginUser={loginUser}
          onAddLayers={this.onAddLayers}
          onDeleteLayers={this.onDeleteLayers}
        />
        <DisplayBody>
          <LayerList
            layers={currentLayers}
            layersStatus={currentLayersStatus}
            selectedLayers={currentSelectedLayers}
            onSelectLayer={onSelectLayer}
            onEditDisplayLayers={this.onEditLayers}
          />
          <DisplayContainer
            key="editor"
            width={editorWidth}
            height={editorHeight}
            padding={editorPadding}
            slideParams={slideParams}
            scale={scale}
            onCoverCutCreated={this.coverCutCreated}
            ref={this.refHandlers.editor}
          >
            {layerItems}
          </DisplayContainer>
          <DisplayBottom
            scale={scale}
            sliderValue={sliderValue}
            onZoomIn={this.zoomIn}
            onZoomOut={this.zoomOut}
            onSliderChange={this.sliderChange}
          />
          <DisplaySidebar>
            <SettingForm
              key={settingInfo.key}
              slideId={currentSlide.id}
              settingInfo={settingInfo.setting}
              settingParams={settingInfo.param}
              onDisplaySizeChange={this.displaySizeChange}
              onGridDistanceChange={this.gridDistanceChange}
              onFormItemChange={this.formItemChange}
              wrappedComponentRef={this.refHandlers.settingForm}
            />
            {currentSelectedLayers.length !== 1 ? (
              <DisplaySetting
                key="displaySetting"
                display={currentDisplay}
                onCoverCut={this.coverCut}
                onCoverUploaded={this.coverUploaded}
              />
            ) : null}
          </DisplaySidebar>
        </DisplayBody>
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  loginUser: makeSelectLoginUser(),
  widgets: makeSelectWidgets(),
  bizlogics: makeSelectBizlogics(),
  displays: makeSelectDisplays(),
  currentDisplay: makeSelectCurrentDisplay(),
  currentSlide: makeSelectCurrentSlide(),
  currentLayers: makeSelectCurrentLayers(),
  currentLayersStatus: makeSelectCurrentLayersStatus(),
  currentSelectedLayers: makeSelectCurrentSelectedLayers(),
  currentDatasources: makeSelectCurrentDatasources(),
  currentLayersLoading: makeSelectCurrentLayersLoading(),
  currentLayersQueryParams: makeSelectCurrentLayersQueryParams()
})

function mapDispatchToProps (dispatch) {
  return {
    onLoadDisplayDetail: (id) => dispatch(loadDisplayDetail(id)),
    onLoadWidgets: () => dispatch(loadWidgets()),
    onLoadBizlogics: () => dispatch(loadBizlogics()),
    onEditCurrentDisplay: (display, resolve?) => dispatch(editCurrentDisplay(display, resolve)),
    onEditCurrentSlide: (displayId, slide, resolve?) => dispatch(editCurrentSlide(displayId, slide, resolve)),
    onUploadCurrentSlideCover: (cover, resolve) => dispatch(uploadCurrentSlideCover(cover, resolve)),
    onLoadBizdatasFromItem: (itemId, id, sql, sorts, offset, limit, useCache, expired) => dispatch(loadBizdatasFromItem(itemId, id, sql, sorts, offset, limit, useCache, expired)),
    onSelectLayer: ({ id, selected, exclusive }) => dispatch(selectLayer({ id, selected, exclusive })),
    onAddDisplayLayers: (displayId, slideId, layers) => dispatch(addDisplayLayers(displayId, slideId, layers)),
    onDeleteDisplayLayers: (displayId, slideId, ids) => dispatch(deleteDisplayLayers(displayId, slideId, ids)),
    onEditDisplayLayers: (displayId, slideId, layers) => dispatch(editDisplayLayers(displayId, slideId, layers)),
    onHideNavigator: () => dispatch(hideNavigator())
  }
}

const withConnect = connect<{}, {}, IEditorProps>(mapStateToProps, mapDispatchToProps)

const withReducer = injectReducer({ key: 'display', reducer })
const withReducerWidget = injectReducer({ key: 'widget', reducer: reducerWidget })

const withSaga = injectSaga({ key: 'display', saga })
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
