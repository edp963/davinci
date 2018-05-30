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
import {
  makeSelectDisplays,
  makeSelectLayers,
  makeSelectLayerStatus,
  makeSelectCurrentItems,
  makeSelectCurrentItemsLoading,
  makeSelectCurrentDatasources,
  makeSelectCurrentItemsQueryParams } from '../selectors'
import { echartsOptionsGenerator } from '../../Widget/components/chartUtil'
import displaySettings from '../../../assets/json/displaySettings'

import DisplayHeader from './DisplayHeader'
import DisplayBody from './DisplayBody'
import LayerList from './LayerList'
import DisplayContainer from './DisplayContainer'
import DisplayBottom from './DisplayBottom'
import DisplaySidebar from './DisplaySidebar'

import LayerItem from './LayerItem'
import SettingForm from './SettingForm'

import { hideNavigator } from '../../App/actions'
import {
  DEFAULT_DISPLAY_WIDTH,
  DEFAULT_DISPLAY_HEIGHT,
  DEFAULT_DISPLAY_GRID_DISTANCE,
  DEFAULT_DISPLAY_SCALE,
  DEFAULT_DISPLAY_SCALE_MODE,
  ECHARTS_RENDERER,
  DEFAULT_PRIMARY_COLOR } from '../../../globalConstants'
import widgetlibs from '../../../assets/json/widgetlib'
const styles = require('../Display.less')

import {
  loadBizlogics,
  loadBizdatasFromItem,
  loadCascadeSourceFromItem,
  loadCascadeSourceFromDashboard,
  loadBizdataSchema  } from '../../Bizlogic/actions'
import { makeSelectBizlogics } from '../../Bizlogic/selectors'
import { GraphTypes, SecondaryGraphTypes } from '../constants'

interface IEditorProps {
  display: any
  layers: any[]
  layerStatus: object
  currentItems: any[]
  currentDatasources: object
  currentItemsLoading: object
  currentItemsQueryParams: object
  onLoadBizlogics: any
  onHideNavigator: () => void
}

interface IEditorStates {
  display: any,
  displayParams: any,
  editorWidth: number,
  editorHeight: number,
  editorPadding: string,
  sliderValue: number

  currentSettingInfoIdx: number
}

export class Editor extends React.Component<IEditorProps, IEditorStates> {
  constructor (props) {
    super(props)
    const { display } = this.props

    this.state = {
      display: { ...display },
      displayParams: JSON.parse(display['display_params']),
      editorWidth: 0,
      editorHeight: 0,
      editorPadding: '',
      sliderValue: 20,
      currentSettingInfoIdx: 0
    }

    this.refHandlers = {
      settingForm: (ref) => this.settingForm = ref
    }
  }

  private refHandlers: { settingForm: (ref: any) => void }
  private settingForm: any
  private editor: any
  private charts: object = {}

  public componentDidMount () {
    this.props.onHideNavigator()
    window.addEventListener('resize', this.containerResize, false)
    // onHideNavigator 导致页面渲染
    setTimeout(() => {
      this.doScale(1)
    })
    const { displayParams } = this.state
    this.settingForm.props.form.setFieldsValue({ ...displayParams })
  }

  public componentWillUnmount () {
    window.removeEventListener('resize', this.containerResize, false)
  }

  public componentWillReceiveProps (nextProps) {
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

    const scale = (displayParams.width / displayParams.height > editorWidth / editorHeight) ?
      // landscape
      (editorWidth - 64) / displayParams.width * times :
      // portrait
      (editorHeight - 64) / displayParams.height * times

    const leftRightPadding = Math.max((offsetWidth - displayParams.width * scale) / 2, 32)
    const topBottomPadding = Math.max((offsetHeight - displayParams.height * scale) / 2, 32)



    this.setState({
      editorWidth: Math.max(editorWidth, displayParams.width * scale + 64),
      editorHeight: Math.max(editorHeight, displayParams.height * scale + 64),
      editorPadding: `${topBottomPadding}px ${leftRightPadding}px`,
      display: {

      }
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

  private displayScaleChange = (event) => {
    const { displayParams } = this.state
    this.setState({
      displayParams: {
        ...displayParams,
        scale: event.target.value
      }
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

  private getChartData = (renderType: string, itemId: number, layerId: number) => {
    const {
      layers,
      onLoadBizlogics
    } = this.props
    const layer = layers.find((layer) => layer.id === layerId)
    const chartInfo = widgetlibs.find((wl) => wl.id === layer.widgetlib_id)
    const chartInstanceId = `layer_${itemId}`
    let currentChart = this.charts[chartInstanceId]

    // if (chartInfo.renderer === ECHARTS_RENDERER) {
    //   switch (renderType) {
    //     case 'rerender':
    //       if (currentChart) {
    //         currentChart.dispose()
    //       }
    //       currentChart = echarts.init(document.getElementById(chartInstanceId), 'default')
    //       this.charts[chartInstanceId] = currentChart
    //       currentChart.showLoading('default', { color: DEFAULT_PRIMARY_COLOR })
    //       break
    //     case 'clear':
    //       currentChart.clear()
    //       currentChart.showLoading('default', { color: DEFAULT_PRIMARY_COLOR })
    //       break
    //     case 'refresh':
    //       currentChart.showLoading('default', { color: DEFAULT_PRIMARY_COLOR })
    //       break
    //     default:
    //       break
    //   }
    // }
  }

  private renderChart = (itemId, layer, dataSource, chartInfo, interactIndex?): void => {
    const chartInstance = this.charts[`layer_${itemId}`]

    echartsOptionsGenerator({
      dataSource,
      chartInfo,
      chartParams: {
        id: layer.id,
        name: layer.name,
        desc: layer.desc,
        flatTable_id: layer.flatTable_id,
        widgetlib_id: layer.widgetlib_id,
        ...JSON.parse(layer.chart_params)
      },
      interactIndex
    })
      .then((chartOptions) => {
        chartInstance.setOption(chartOptions)
        // this.registerChartInteractListener(chartInstance, itemId)
        chartInstance.hideLoading()
      })
  }

  private formItemChange = (field) => (val) => {
    const {
      displayParams,
      currentSettingInfoIdx
    } = this.state

    if (currentSettingInfoIdx === 0) {
      this.setState({
        displayParams: {
          ...displayParams,
          [field]: val
        }
      })
    } else {
      this.setState({
        layerParams: {
          ...layerParams,
          [field]: val
        }
      })
    }
  }

  private getSettingInfo = (nextProps) => {
    const {
      layers,
      layerStatus } = nextProps
    const {
      displayParams
    } = this.state

    const selectionLayerIds = []
    Object.keys(layerStatus).forEach((id) => {
      if (layerStatus[id]) {
        selectionLayerIds.push(id)
      }
    })

    let idx = 0
    if (selectionLayerIds.length === 1) {
      const selectedLayer = layers.find((layer) => layer.id.toString() === selectionLayerIds[0])
      if (selectedLayer) {
        switch (selectedLayer.graphType) {
          case GraphTypes.Secondary:
            idx = displaySettings.findIndex((ds) => ds.name === selectedLayer.secondaryGraphType.toLowerCase())
            break
          default:
            break
        }
        this.settingForm.props.form.setFieldsValue({ ...selectedLayer.layerParams })
      }
    }
    this.settingForm.props.form.setFieldsValue({ ...displayParams })

    this.setState({
      currentSettingInfoIdx: idx
    })
  }

  public render () {
    const {
      display,
      layers
    } = this.props

    const {
      displayParams,
      editorWidth,
      editorHeight,
      editorPadding,
      sliderValue,
      currentSettingInfoIdx
    } = this.state

    const currentSettingInfo = displaySettings[currentSettingInfoIdx]

    const layerItems = layers.map((layer, idx) => (
      <LayerItem
        ref={(f) => this[`layerId_${layer.id}`]}
        displayParams={displayParams}
        layerParams={layer.layerParams}
        layer={layer}
        onGetChartData={this.getChartData}
      />
    ))

    return (
      <div className={styles.displayEdit}>
        <DisplayHeader/>
        <DisplayBody>
          <LayerList/>
          <DisplayContainer
            key="editor"
            width={editorWidth}
            height={editorHeight}
            padding={editorPadding}
            displayParams={displayParams}
            ref={(f) => { this.editor = f }}
          >
            {layerItems}
          </DisplayContainer>
          <DisplayBottom
            sliderValue={sliderValue}
            onZoomIn={this.zoomIn}
            onZoomOut={this.zoomOut}
            onSliderChange={this.sliderChange}
          />
          <DisplaySidebar>
            <SettingForm
              settingInfo={currentSettingInfo}
              onDisplaySizeChange={this.displaySizeChange}
              onDisplayScaleChange={this.displayScaleChange}
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
  displays: makeSelectDisplays(),
  layers: makeSelectLayers(),
  layerStatus: makeSelectLayerStatus(),
  currentItems: makeSelectCurrentItems(),
  currentDatasources: makeSelectCurrentDatasources(),
  currentItemsLoading: makeSelectCurrentItemsLoading(),
  currentItemsQueryParams: makeSelectCurrentItemsQueryParams()
})

function mapDispatchToProps (dispatch) {
  return {
    onLoadBizlogics: () => dispatch(loadBizlogics()),
    onLoadBizdatasFromItem: (itemId, id, sql, sorts, offset, limit, useCache, expired) => dispatch(loadBizdatasFromItem(itemId, id, sql, sorts, offset, limit, useCache, expired)),
    onHideNavigator: () => dispatch(hideNavigator())
  }
}

export default connect<{}, {}, IEditorProps>(mapStateToProps, mapDispatchToProps)(Editor)
