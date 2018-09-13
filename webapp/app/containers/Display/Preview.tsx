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
  makeSelectCurrentLayersInfo,
  makeSelectCurrentSelectedLayers } from './selectors'

import { hideNavigator } from '../App/actions'
import { loadWidgets } from '../Widget/actions'
import {
  loadBizlogics,
  loadDataFromItem,
  loadCascadeSource, // TODO global filter in Display Preview
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

import { IPivotProps, RenderType } from '../Widget/components/Pivot/Pivot'
import { decodeMetricName } from '../Widget/components/util'

interface IBizdataIncomeParamObject {
  k: string
  v: string
}

interface IPreviewProps {
  params: any
  widgets: any[]
  bizlogics: any[]
  currentDisplay: any
  currentSlide: any
  currentLayers: any[]
  currentLayersInfo: {
    [key: string]: {
      datasource: any[]
      loading: boolean
      selected: boolean
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
  }
  onHideNavigator: () => void
  onLoadWidgets: (projectId: number) => void
  onLoadBizlogics: () => any
  onLoadDisplayDetail: (id: any) => void
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
      cache: boolean
      expired: number
    }
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

  private getChartData = (renderType: RenderType, itemId: number, widgetId: number, queryParams?: any) => {
    const {
      currentLayersInfo,
      widgets,
      onLoadDataFromItem
    } = this.props

    const widget = widgets.find((w) => w.id === widgetId)
    const widgetConfig: IPivotProps = JSON.parse(widget.config)
    const { cols, rows, metrics, filters, color, label, size, xAxis } = widgetConfig

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

    let groups = cols.concat(rows)
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
    if (xAxis) {
      aggregators = aggregators.concat(xAxis.items
        .map((l) => ({
          column: decodeMetricName(l.name),
          func: l.agg
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
        cache: false,
        expired: 0
      }
    )
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
      currentLayersInfo } = this.props
    if (!currentDisplay) { return null }

    const { scale } = this.state
    const slideStyle = this.getSlideStyle(JSON.parse(currentSlide.config).slideParams)
    const layerItems =  Array.isArray(widgets) ? currentLayers.map((layer) => {
      const widget = widgets.find((w) => w.id === layer.widgetId)
      const chartInfo = widget && widgetlibs.find((wl) => wl.id === widget.type)
      const layerId = layer.id

      const { polling, frequency } = layer.params
      const { datasource, loading, selected, interactId, rendered, renderType } = currentLayersInfo[layerId]

      return (
        <LayerItem
          key={layer.id}
          ref={(f) => this[`layerId_${layer.id}`]}
          pure={true}
          scale={scale}
          layer={layer}
          selected={selected}
          itemId={layerId}
          widget={widget}
          data={datasource}
          loading={loading}
          polling={polling}
          frequency={frequency}
          interactId={interactId}
          rendered={rendered}
          renderType={renderType}
          onGetChartData={this.getChartData}
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
  currentLayersInfo: makeSelectCurrentLayersInfo(),
  currentSelectedLayers: makeSelectCurrentSelectedLayers()
})

export function mapDispatchToProps (dispatch) {
  return {
    onHideNavigator: () => dispatch(hideNavigator()),
    onLoadDisplayDetail: (id) => dispatch(loadDisplayDetail(id)),
    onLoadWidgets: (projectId: number) => dispatch(loadWidgets(projectId)),
    onLoadBizlogics: (projectId: number, resolve?: any) => dispatch(loadBizlogics(projectId, resolve)),
    onLoadDataFromItem: (renderType, itemId, viewId, params) => dispatch(loadDataFromItem(renderType, itemId, viewId, params, 'display'))
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
