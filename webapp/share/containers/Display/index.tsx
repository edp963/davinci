import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import Helmet from 'react-helmet'
import * as echarts from 'echarts/lib/echarts'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import * as classnames from 'classnames'

import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import { echartsOptionsGenerator } from '../../../app/containers/Widget/components/chartUtil'
import {
  ECHARTS_RENDERER,
  DEFAULT_PRIMARY_COLOR } from '../../../app/globalConstants'
import widgetlibs from '../../../app/assets/json/widgetlib'
import Login from '../../components/Login/index'
import LayerItem from '../../../app/containers/Display/components/LayerItem'

const styles = require('../../../app/containers/Display/Display.less')

import {
  loadBizlogics,
  loadCascadeSourceFromItem,
  loadCascadeSourceFromDashboard,
  loadBizdataSchema  } from '../../../app/containers/Bizlogic/actions'
import { loadDisplay, loadLayerData } from './actions'
import {
  makeSelectTitle,
  makeSelectDisplay,
  makeSelectSlide,
  makeSelectLayers,
  makeSelectWidgets,
  makeSelectDatasources,
  makeSelectLoadings,
  makeSelectLayersQueryParams
} from './selectors'

interface IDisplayProps extends RouteComponentProps<{}, {}> {
  title: string
  display: any
  slide: any
  layers: any
  widgets: any
  datasources: any
  loadings: any
  layersQueryParams: any
  onLoadDisplay: (token, resolve, reject) => void
  onLoadLayerData: (layerId: number, token: string) => void
}

interface IDisplayStates {
  scaleHeight: number
  scaleWidth: number
  showLogin: boolean
  shareInfo: string
}

export class Display extends React.Component<IDisplayProps, IDisplayStates> {

  private charts: object = {}

  public constructor (props) {
    super(props)
    this.state = {
      scaleHeight: 1,
      scaleWidth: 1,
      showLogin: false,
      shareInfo: ''
    }
  }

  public componentWillMount () {
    const { shareInfo } = this.props.location.query
    this.setState({
      shareInfo
    }, () => {
      this.loadShareContent()
    })
  }

  public componentWillReceiveProps (nextProps: IDisplayProps) {
    const { slide } = nextProps
    const { scaleHeight, scaleWidth } = this.state
    if (slide && this.props.slide !== slide) {
      const { slideParams } = JSON.parse(slide.config)
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
        this.setState({ scaleHeight: nextScaleHeight, scaleWidth: nextScaleWidth })
      }
    }
  }

  private getChartData = (renderType: string, itemId: number, widgetId: number, queryParams?: any) => {
    const {
      widgets,
      layers,
      layersQueryParams,
      onLoadLayerData
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

    const cachedQueryParams = layersQueryParams[itemId]

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

    onLoadLayerData(itemId, widget.dataToken)
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
    const { scaleHeight, scaleWidth } = this.state

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
      width: `${width * scaleWidth}px`,
      height: `${height * scaleHeight}px`
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

  private loadShareContent = () => {
    const { onLoadDisplay } = this.props
    const { shareInfo } = this.state
    onLoadDisplay(shareInfo, () => {}, () => {
      this.setState({
        showLogin: true
      })
    })
  }

  private handleLegitimateUser = () => {
    this.setState({
      showLogin: false
    }, () => {
      this.loadShareContent()
    })
  }

  public render () {
    const {
      title,
      widgets,
      display,
      slide,
      layers,
      datasources,
      loadings,
      layersQueryParams
    } = this.props

    const { scaleHeight, scaleWidth, showLogin, shareInfo } = this.state
    const loginPanel = showLogin ? <Login shareInfo={shareInfo} legitimateUser={this.handleLegitimateUser} /> : null

    let content = null
    if (display) {
      const slideStyle = this.getSlideStyle(JSON.parse(slide.config).slideParams)
      const layerItems =  Array.isArray(widgets) ? layers.map((layer) => {
        const widget = widgets.find((w) => w.id === layer.widgetId)
        const chartInfo = widget && widgetlibs.find((wl) => wl.id === widget.type)
        const layerId = layer.id
        const data = datasources[layerId]
        const loading = loadings[layerId]
        const sql = layersQueryParams[layerId]

        return (
          <LayerItem
            pure={true}
            scaleHeight={scaleHeight}
            scaleWidth={scaleWidth}
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
      content = (
        <div className={styles.board} style={slideStyle}>
          {layerItems}
        </div>
      )
    }

    return (
      <div className={styles.preview}>
        <Helmet title={title} />
        {content}
        {loginPanel}
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  title: makeSelectTitle(),
  display: makeSelectDisplay(),
  slide: makeSelectSlide(),
  layers: makeSelectLayers(),
  widgets: makeSelectWidgets(),
  datasources: makeSelectDatasources(),
  loadings: makeSelectLoadings(),
  layersQueryParams: makeSelectLayersQueryParams()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDisplay: (token, resolve, reject) => dispatch(loadDisplay(token, resolve, reject)),
    onLoadLayerData: (layerId: string, token: string) => dispatch(loadLayerData(layerId, token))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)
const withReducer = injectReducer({ key: 'shareDisplay', reducer })
const withSaga = injectSaga({ key: 'shareDisplay', saga })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(Display)
