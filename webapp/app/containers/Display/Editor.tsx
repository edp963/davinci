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
  makeSelectDisplays,
  makeSelectCurrentLayers,
  makeSelectCurrentLayersStatus,
  makeSelectCurrentSelectedLayers,
  makeSelectCurrentLayersLoading,
  makeSelectCurrentDatasources,
  makeSelectCurrentLayersQueryParams } from './selectors'
import { makeSelectLoginUser } from '../../containers/App/selectors'
import { echartsOptionsGenerator } from '../Widget/components/chartUtil'
import displaySettings from '../../assets/json/displaySettings'

import DisplayHeader from './components/DisplayHeader'
import DisplayBody from './components/DisplayBody'
import LayerList from './components/LayerList'
import DisplayContainer from './components/DisplayContainer'
import DisplayBottom from './components/DisplayBottom'
import DisplaySidebar from './components/DisplaySidebar'

import LayerItem from './components/LayerItem'
import SettingForm from './components/SettingForm'

import { hideNavigator } from '../App/actions'
import { loadWidgets } from '../Widget/actions'
import {
  editCurrentDisplay,
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
import { GraphTypes, SecondaryGraphTypes } from './constants'

interface IEditorProps {
  params: any
  loginUser: any
  widgets: any[]
  bizlogics: any[]
  currentDisplay: any
  currentLayers: any[]
  currentLayersStatus: object
  currentSelectedLayers: any[]
  currentDatasources: object
  currentLayersLoading: object
  currentLayersQueryParams: object
  onLoadWidgets: () => void
  onLoadBizlogics: () => any
  onEditCurrentDisplay: (display: any, resolve: any) => void
  onLoadDisplayDetail: (id: any) => void
  onSelectLayer: (obj: { id: any, selected: boolean, exclusive: boolean }) => void
  onAddDisplayLayers: (layers: any[]) => void
  onDeleteDisplayLayers: (ids: any[]) => void,
  onEditDisplayLayers: (layers: any[]) => void
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
  displayParams: any,
  editorWidth: number,
  editorHeight: number,
  editorPadding: string,
  scale: number,
  sliderValue: number
  currentSettingInfoIdx: number
  triggerType: string
}

export class Editor extends React.Component<IEditorProps, IEditorStates> {
  constructor (props) {
    super(props)

    this.state = {
      displayParams: {},
      editorWidth: 0,
      editorHeight: 0,
      editorPadding: '',
      scale: 1,
      sliderValue: 20,
      currentSettingInfoIdx: 0,
      triggerType: 'manual'
    }

    this.refHandlers = {
      settingForm: (ref) => this.settingForm = ref
    }
  }

  private refHandlers: { settingForm: (ref: any) => void }
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
    const displayId = params.displayId
    onLoadBizlogics()
    onLoadDisplayDetail(displayId)
    onLoadWidgets()
  }

  public componentDidMount () {
    const {
      displayParams,
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
    const { currentDisplay } = nextProps
    if (currentDisplay !== this.props.currentDisplay) {
      const displayParams = JSON.parse(currentDisplay['display_params'])
      this.setState({
        displayParams
      }, () => {
        this.doScale(this.state.scale)
      })
    }
    this.getSettingInfo(nextProps)
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
    const { displayParams } = this.state
    const { offsetWidth, offsetHeight } = this.editor.container

    const editorWidth = Math.max(offsetWidth * times, offsetWidth)
    const editorHeight = Math.max(offsetHeight * times, offsetHeight)

    let scale = (displayParams.width / displayParams.height > editorWidth / editorHeight) ?
      // landscape
      (editorWidth - 64) / displayParams.width * times :
      // portrait
      (editorHeight - 64) / displayParams.height * times
    scale = +(Math.floor(scale / 0.05) * 0.05).toFixed(2)

    const leftRightPadding = Math.max((offsetWidth - displayParams.width * scale) / 2, 32)
    const topBottomPadding = Math.max((offsetHeight - displayParams.height * scale) / 2, 32)

    console.log(scale)
    console.log({
      editorWidth: Math.max(editorWidth, displayParams.width * scale + 64),
      editorHeight: Math.max(editorHeight, displayParams.height * scale + 64),
      editorPadding: `${topBottomPadding}px ${leftRightPadding}px`
    })

    this.setState({
      editorWidth: Math.max(editorWidth, displayParams.width * scale + 64),
      editorHeight: Math.max(editorHeight, displayParams.height * scale + 64),
      editorPadding: `${topBottomPadding}px ${leftRightPadding}px`,
      scale
    })
  }

  private displaySizeChange = (width, height) => {
    const { displayParams } = this.state
    this.setState({
      displayParams: {
        ...displayParams,
        width,
        height
      }
    }, () => {
      this.sliderChange(this.state.sliderValue)
    })
  }

  private gridDistanceChange = (gridDistance) => {
    const { displayParams } = this.state
    this.setState({
      displayParams: {
        ...displayParams,
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
    const { onEditDisplayLayers } = this.props
    const layerParams = {
      ...JSON.parse(layer['layer_params']),
      ...size
    }
    onEditDisplayLayers([{
      ...layer,
      layer_params: JSON.stringify(layerParams)
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
    const {
      displayParams,
      currentSettingInfoIdx
    } = this.state

    const {
      currentDisplay,
      currentSelectedLayers,
      onEditCurrentDisplay,
      onEditDisplayLayers } = this.props

    if (currentSettingInfoIdx === 0) {
      // this.setState({
      //   displayParams: {
      //     ...displayParams,
      //     [field]: val
      //   }
      // })
      const newDisplayParams = {
        ...displayParams,
        [field]: val
      }
      onEditCurrentDisplay({
        ...currentDisplay,
        display_params: JSON.stringify(newDisplayParams)
      }, () => {})
    } else {
      const selectedLayer = currentSelectedLayers[0]
      const layerParams = {
        ...JSON.parse(selectedLayer['layer_params']),
        [field]: val
      }
      onEditDisplayLayers([{
        ...selectedLayer,
        layer_params: JSON.stringify(layerParams)
      }])
    }
  }

  private getSettingInfo = (nextProps: IEditorProps) => {
    const { currentSelectedLayers } = nextProps
    const {
      displayParams
    } = this.state

    let idx = 0
    if (currentSelectedLayers.length === 1) {
      const selectedLayer = currentSelectedLayers[0]
      const name = (selectedLayer.secondaryGraphType || selectedLayer.graphType).toLowerCase()
      idx = displaySettings.findIndex((ds) => ds.name === name)
      // this.settingForm.props.form.setFieldsValue(JSON.parse(selectedLayer['layer_params']))
    } else {
      // this.settingForm.props.form.setFieldsValue({ ...displayParams })
    }

    this.setState({
      currentSettingInfoIdx: idx
    })
  }

  private onDeleteLayers = (ids) => {
    this.props.onDeleteDisplayLayers(ids)
  }

  private onAddLayers = (layers: any[]) => {
    if (!Array.isArray(layers)) { return }

    const {
      currentLayers,
      onAddDisplayLayers
    } = this.props
    const { displayParams } = this.state
    const { gridDistance } = displayParams
    let maxLayerIndex = currentLayers.reduce((acc, layer) => Math.max(acc, layer.layerIndex), -Infinity)
    layers.forEach((layer) => {
      layer.layerIndex = ++maxLayerIndex
      layer['layer_params'] = JSON.stringify({
        ...JSON.parse(layer['layer_params']),
        width: displayParams.width / 4,
        height: displayParams.height / 4,
        positionX: gridDistance,
        positionY: gridDistance
      })
    })
    onAddDisplayLayers(layers)
  }

  public render () {
    const {
      loginUser,
      currentLayersStatus,
      currentLayersLoading,
      currentSelectedLayers,
      currentLayersQueryParams,
      currentDatasources,
      widgets,
      currentDisplay,
      currentLayers,
      onSelectLayer,
      onEditDisplayLayers
    } = this.props

    const {
      displayParams,
      editorWidth,
      editorHeight,
      editorPadding,
      scale,
      sliderValue,
      currentSettingInfoIdx
    } = this.state

    const currentSettingInfo = displaySettings[currentSettingInfoIdx]

    const layerItems =  !Array.isArray(widgets) ? null : currentLayers.map((layer, idx) => {
      const widget = widgets.find((w) => w.id === layer.widget_id)
      const chartInfo = widget && widgetlibs.find((wl) => wl.id === widget.widgetlib_id)
      const layerId = layer.id
      const data = currentDatasources[layerId]
      const loading = currentLayersLoading[layerId]
      const sql = currentLayersQueryParams[layerId]

      return (
        <LayerItem
          ref={(f) => this[`layerId_${layer.id}`]}
          itemId={layerId}
          widget={widget}
          chartInfo={chartInfo}
          data={data}
          key={layer.id}
          scale={scale}
          displayParams={displayParams}
          layer={layer}
          loading={loading}
          layersStatus={currentLayersStatus}
          onSelectLayer={onSelectLayer}
          onGetChartData={this.getChartData}
          onRenderChart={this.renderChart}
          onResizeLayerStop={this.resizeLayerStop}
        />)
    })

    return (
      <div className={styles.displayEdit}>
        <Helmet title={currentDisplay && currentDisplay.name} />
        <DisplayHeader
          widgets={widgets}
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
            onEditDisplayLayers={onEditDisplayLayers}
          />
          <DisplayContainer
            key="editor"
            width={editorWidth}
            height={editorHeight}
            padding={editorPadding}
            displayParams={displayParams}
            scale={scale}
            ref={(f) => { this.editor = f }}
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
              key={currentSettingInfoIdx === 0 ? 'display' : `layer_${currentSelectedLayers[0].id}`}
              settingInfo={currentSettingInfo}
              settingParams={currentSettingInfoIdx === 0 ? displayParams : JSON.parse(currentSelectedLayers[0]['layer_params'])}
              onDisplaySizeChange={this.displaySizeChange}
              onGridDistanceChange={this.gridDistanceChange}
              onFormItemChange={this.formItemChange}
              wrappedComponentRef={this.refHandlers.settingForm}
            />
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
  currentDisplay: makeSelectCurrentDisplay(),
  displays: makeSelectDisplays(),
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
    onEditCurrentDisplay: (display, resolve) => dispatch(editCurrentDisplay(display, resolve)),
    onLoadBizdatasFromItem: (itemId, id, sql, sorts, offset, limit, useCache, expired) => dispatch(loadBizdatasFromItem(itemId, id, sql, sorts, offset, limit, useCache, expired)),
    onSelectLayer: ({ id, selected, exclusive }) => dispatch(selectLayer({ id, selected, exclusive })),
    onAddDisplayLayers: (layers) => dispatch(addDisplayLayers(layers)),
    onDeleteDisplayLayers: (ids) => dispatch(deleteDisplayLayers(ids)),
    onEditDisplayLayers: (layers) => dispatch(editDisplayLayers(layers)),
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
