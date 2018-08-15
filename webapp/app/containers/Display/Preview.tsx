import * as React from 'react'
import * as classnames from 'classnames'
import Helmet from 'react-helmet'
import * as echarts from 'echarts/lib/echarts'
import { Link, InjectedRouter } from 'react-router'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import { compose } from 'redux'
import reducer from './reducer'
import reducerWidget from '../Widget/reducer'
import saga from './sagas'
import sagaWidget from '../Widget/sagas'
import reducerBizlogic from '../Bizlogic/reducer'
import sagaBizlogic from '../Bizlogic/sagas'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'

import { GraphTypes, SecondaryGraphTypes } from 'utils/util'
import { echartsOptionsGenerator } from '../Widget/components/chartUtil'

import Container from '../../components/Container'
import DisplayForm from './components/DisplayForm'
import { WrappedFormUtils } from 'antd/lib/form/Form'

import { makeSelectWidgets } from '../Widget/selectors'
import { makeSelectBizlogics } from '../Bizlogic/selectors'
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

import { hideNavigator } from '../App/actions'
import { loadWidgets } from '../Widget/actions'
import {
  loadBizlogics,
  loadBizdatasFromItem,
  loadCascadeSourceFromItem,
  loadCascadeSourceFromDashboard,
  loadBizdataSchema  } from '../Bizlogic/actions'
import {
  editCurrentDisplay,
  loadDisplayDetail,
  selectLayer,
  addDisplayLayers,
  deleteDisplayLayers,
  editDisplayLayers } from './actions'
import {
  ECHARTS_RENDERER,
  DEFAULT_PRIMARY_COLOR } from '../../globalConstants'
import widgetlibs from '../../assets/json/widgetlib'
import LayerItem from './components/LayerItem'

const styles = require('./Display.less')
const stylesDashboard = require('../Dashboard/Dashboard.less')
interface IPreviewProps {
  params: any
  widgets: any[]
  bizlogics: any[]
  currentDisplay: any
  currentSlide: any
  currentLayers: any[]
  currentDatasources: object
  currentLayersLoading: object
  currentLayersQueryParams: object
  onHideNavigator: () => void
  onLoadWidgets: (projectId: number) => void
  onLoadBizlogics: () => any
  onLoadDisplayDetail: (id: any) => void
  onLoadBizdatasFromItem: (
    dashboardItemId: number,
    viewId: number,
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

interface IPreviewStates {
  scale: [number, number]
}

export class Preview extends React.Component<IPreviewProps, IPreviewStates> {

  private charts: object = {}

  public constructor (props) {
    super(props)
    this.state = {
      scale: [1, 1]
    }
  }

  public componentWillMount () {
    const {
      params,
      onLoadWidgets,
      onLoadBizlogics,
      onLoadDisplayDetail
    } = this.props
    const projectId = +params.pid
    const displayId = +params.displayId
    onLoadWidgets(projectId)
    onLoadDisplayDetail(displayId)
  }

  public componentDidMount () {
    this.props.onHideNavigator()
  }

  public componentWillReceiveProps (nextProps: IPreviewProps) {
    const { currentSlide } = nextProps
    const { scale } = this.state
    const [scaleWidth, scaleHeight] = scale
    if (currentSlide && this.props.currentSlide !== currentSlide) {
      const { slideParams } = JSON.parse(currentSlide.config)
      const { scaleMode, width, height } = slideParams
      const { clientHeight, clientWidth } = document.body
      let nextScaleHeight = 1
      let nextScaleWidth = 1
      switch (scaleMode) {
        case 'scaleHeight':
          nextScaleWidth = nextScaleHeight = clientHeight / height
          break
        case 'scaleWidth':
          nextScaleHeight = nextScaleWidth = clientWidth / width
          break
        case 'scaleFull':
          nextScaleHeight = clientHeight / height
          nextScaleWidth = clientWidth / width
      }
      if (scaleHeight !== nextScaleHeight || scaleWidth !== nextScaleWidth) {
        this.setState({ scale: [nextScaleWidth, nextScaleHeight] })
      }
    }
  }

  private getChartData = (renderType: string, itemId: number, widgetId: number, queryParams?: any) => {
    const {
      widgets,
      currentLayers,
      currentLayersQueryParams,
      onLoadBizdatasFromItem
    } = this.props
    const widget = widgets.find((w) => w.id === widgetId)
    const chartInfo = widgetlibs.find((wl) => wl.id === widget.type)
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
      widget.viewId,
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

  private renderChart = (itemId, widget, dataSource, chartInfo, interactIndex?): void => {
    const chartInstance = this.charts[`widget_${itemId}`]

    echartsOptionsGenerator({
      dataSource,
      chartInfo,
      chartParams: {
        id: widget.id,
        name: widget.name,
        desc: widget.desc,
        flatTable_id: widget.viewId,
        widgetlib_id: widget.type,
        ...JSON.parse(widget.config).chartParams
      },
      interactIndex
    })
      .then((chartOptions) => {
        chartInstance.setOption(chartOptions)
        // this.registerChartInteractListener(chartInstance, itemId)
        chartInstance.hideLoading()
      })
  }

  private getSlideStyle = (slideParams) => {
    const { scale } = this.state

    const {
      width,
      height,
      backgroundColor,
      opacity,
      backgroundImage
    } = slideParams

    let slideStyle: React.CSSProperties
    slideStyle  = {
      overflow: 'visible',
      width: `${width * scale[0]}px`,
      height: `${height * scale[1]}px`
    }

    if (backgroundColor) {
      const rgb = [...backgroundColor, (opacity / 100)].join()
      slideStyle.backgroundColor = `rgb(${rgb})`
    }
    if (backgroundImage) {
      slideStyle.backgroundImage = `url("${backgroundImage}")`
    }
    return slideStyle
  }

  public render () {
    const {
      widgets,
      currentDisplay,
      currentSlide,
      currentLayers,
      currentDatasources,
      currentLayersLoading,
      currentLayersQueryParams } = this.props
    if (!currentDisplay) { return null }

    const { scale } = this.state
    const slideStyle = this.getSlideStyle(JSON.parse(currentSlide.config).slideParams)
    const layerItems =  Array.isArray(widgets) ? currentLayers.map((layer) => {
      const widget = widgets.find((w) => w.id === layer.widgetId)
      const chartInfo = widget && widgetlibs.find((wl) => wl.id === widget.type)
      const layerId = layer.id
      const data = currentDatasources[layerId]
      const loading = currentLayersLoading[layerId]
      const sql = currentLayersQueryParams[layerId]

      return (
        <LayerItem
          pure={true}
          scale={scale}
          ref={(f) => this[`layerId_${layer.id}`]}
          itemId={layerId}
          widget={widget}
          chartInfo={chartInfo}
          data={data}
          key={layer.id}
          layer={layer}
          loading={loading}
          onGetChartData={this.getChartData}
          onRenderChart={this.renderChart}
        />
      )
    }) : null
    return (
      <div className={styles.preview}>
        <div className={styles.board} style={slideStyle}>
          {layerItems}
        </div>
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  widgets: makeSelectWidgets(),
  bizlogics: makeSelectBizlogics(),
  currentDisplay: makeSelectCurrentDisplay(),
  currentSlide: makeSelectCurrentSlide(),
  displays: makeSelectDisplays(),
  currentLayers: makeSelectCurrentLayers(),
  currentLayersStatus: makeSelectCurrentLayersStatus(),
  currentSelectedLayers: makeSelectCurrentSelectedLayers(),
  currentDatasources: makeSelectCurrentDatasources(),
  currentLayersLoading: makeSelectCurrentLayersLoading(),
  currentLayersQueryParams: makeSelectCurrentLayersQueryParams()
})

export function mapDispatchToProps (dispatch) {
  return {
    onHideNavigator: () => dispatch(hideNavigator()),
    onLoadDisplayDetail: (id) => dispatch(loadDisplayDetail(id)),
    onLoadWidgets: (projectId: number) => dispatch(loadWidgets(projectId)),
    onLoadBizlogics: (projectId: number) => dispatch(loadBizlogics(projectId)),
    onLoadBizdatasFromItem: (itemId, id, sql, sorts, offset, limit, useCache, expired) => dispatch(loadBizdatasFromItem(itemId, id, sql, sorts, offset, limit, useCache, expired))
  }
}

const withReducer = injectReducer({ key: 'display', reducer })
const withReducerWidget = injectReducer({ key: 'widget', reducer: reducerWidget })

const withSaga = injectSaga({ key: 'display', saga })
const withSagaWidget = injectSaga({ key: 'widget', saga: sagaWidget })

const withReducerBizlogic = injectReducer({ key: 'bizlogic', reducer: reducerBizlogic })
const withSagaBizlogic = injectSaga({ key: 'bizlogic', saga: sagaBizlogic })

const withConnect = connect<{}, {}, IPreviewProps>(mapStateToProps, mapDispatchToProps)

export default compose(
  withReducer,
  withReducerWidget,
  withReducerBizlogic,
  withSaga,
  withSagaWidget,
  withSagaBizlogic,
  withConnect)(Preview)
