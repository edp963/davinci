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
import { RouteComponentProps } from 'react-router'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import { compose } from 'redux'
import injectReducer from 'utils/injectReducer'
import injectSaga from 'utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import { FieldSortTypes } from 'containers/Widget/components/Config/Sort'
import { widgetDimensionMigrationRecorder } from 'utils/migrationRecorders'

import Login from '../../components/Login/index'
import LayerItem from '../../../app/containers/Display/components/LayerItem'
import { RenderType, IWidgetConfig } from '../../../app/containers/Widget/components/Widget'
import { decodeMetricName } from '../../../app/containers/Widget/components/util'

const mainStyles = require('../../../app/containers/Main/Main.less')
const styles = require('../../../app/containers/Display/Display.less')

import ShareDisplayActions from './actions'
const { loadDisplay, loadLayerData } = ShareDisplayActions
import {
  makeSelectTitle,
  makeSelectDisplay,
  makeSelectSlide,
  makeSelectLayers,
  makeSelectWidgets,
  makeSelectLayersInfo
} from './selectors'
import { IQueryConditions, IDataRequestParams } from '../../../app/containers/Dashboard/Grid'

interface IDisplayProps extends RouteComponentProps<{}, {}> {
  title: string
  display: any
  slide: any
  layers: any
  widgets: any
  layersInfo: {
    [key: string]: {
      datasource: {
        pageNo: number
        pageSize: number
        resultList: any[]
        totalCount: number
      }
      loading: boolean
      queryConditions: IQueryConditions
      downloadCsvLoading: boolean
      interactId: string
      renderType: RenderType
    }
  }
  onLoadDisplay: (token, resolve, reject) => void
  onLoadLayerData: (
    renderType: RenderType,
    layerId: number,
    dataToken: string,
    requestParams: IDataRequestParams
  ) => void
}

interface IDisplayStates {
  scale: [number, number]
  showLogin: boolean
  shareInfo: string
}

export class Display extends React.Component<IDisplayProps, IDisplayStates> {

  private charts: object = {}

  public constructor (props) {
    super(props)
    this.state = {
      scale: [1, 1],
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
    const { scale } = this.state
    const [scaleWidth, scaleHeight] = scale
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
        this.setState({ scale: [nextScaleWidth, nextScaleHeight] })
      }
    }
  }

  private getChartData = (renderType: RenderType, itemId: number, widgetId: number, queryConditions?: Partial<IQueryConditions>) => {
    const {
      widgets,
      layersInfo,
      onLoadLayerData
    } = this.props

    const widget = widgets.find((w) => w.id === widgetId)
    const widgetConfig: IWidgetConfig = JSON.parse(widget.config)
    const { cols, rows, metrics, secondaryMetrics, filters, color, label, size, xAxis, tip, orders, cache, expired } = widgetConfig
    const updatedCols = cols.map((col) => widgetDimensionMigrationRecorder(col))
    const updatedRows = rows.map((row) => widgetDimensionMigrationRecorder(row))
    const customOrders = updatedCols.concat(updatedRows)
      .filter(({ sort }) => sort && sort.sortType === FieldSortTypes.Custom)
      .map(({ name, sort }) => ({ name, list: sort[FieldSortTypes.Custom].sortList }))

    const cachedQueryConditions = layersInfo[itemId].queryConditions

    let tempFilters
    let linkageFilters
    let globalFilters
    let tempOrders
    let variables
    let linkageVariables
    let globalVariables
    let pagination
    let nativeQuery

    if (queryConditions) {
      tempFilters = queryConditions.tempFilters !== void 0 ? queryConditions.tempFilters : cachedQueryConditions.tempFilters
      linkageFilters = queryConditions.linkageFilters !== void 0 ? queryConditions.linkageFilters : cachedQueryConditions.linkageFilters
      globalFilters = queryConditions.globalFilters !== void 0 ? queryConditions.globalFilters : cachedQueryConditions.globalFilters
      tempOrders = queryConditions.orders !== void 0 ? queryConditions.orders : cachedQueryConditions.orders
      variables = queryConditions.variables || cachedQueryConditions.variables
      linkageVariables = queryConditions.linkageVariables || cachedQueryConditions.linkageVariables
      globalVariables = queryConditions.globalVariables || cachedQueryConditions.globalVariables
      pagination = queryConditions.pagination || cachedQueryConditions.pagination
      nativeQuery = queryConditions.nativeQuery || cachedQueryConditions.nativeQuery
    } else {
      tempFilters = cachedQueryConditions.tempFilters
      linkageFilters = cachedQueryConditions.linkageFilters
      globalFilters = cachedQueryConditions.globalFilters
      tempOrders = cachedQueryConditions.orders
      variables = cachedQueryConditions.variables
      linkageVariables = cachedQueryConditions.linkageVariables
      globalVariables = cachedQueryConditions.globalVariables
      pagination = cachedQueryConditions.pagination
      nativeQuery = cachedQueryConditions.nativeQuery
    }

    let groups = cols.concat(rows).filter((g) => g.name !== '指标名称').map((g) => g.name)
    let aggregators =  metrics.map((m) => ({
      column: decodeMetricName(m.name),
      func: m.agg
    }))

    if (secondaryMetrics && secondaryMetrics.length) {
      aggregators = aggregators.concat(secondaryMetrics.map((second) => ({
        column: decodeMetricName(second.name),
        func: second.agg
      })))
    }

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

    const requestParams = {
      groups,
      aggregators,
      filters: filters.map((i) => i.config.sql),
      tempFilters,
      linkageFilters,
      globalFilters,
      variables,
      linkageVariables,
      globalVariables,
      orders,
      cache,
      expired,
      flush: renderType === 'refresh',
      pagination,
      nativeQuery,
      customOrders
    }

    if (tempOrders) {
      requestParams.orders = requestParams.orders.concat(tempOrders)
    }

    onLoadLayerData(
      renderType,
      itemId,
      widget.dataToken,
      requestParams
    )
  }

  private getPreviewStyle = (slideParams) => {
    const { scaleMode } = slideParams
    const previewStyle: React.CSSProperties = {}
    switch (scaleMode) {
      case 'scaleWidth':
        previewStyle.overflowY = 'auto'
        break
      case 'scaleHeight':
        previewStyle.overflowX = 'auto'
        break
      case 'noScale':
        previewStyle.overflow = 'auto'
        break
      case 'scaleFull':
      default:
        break
    }
    return previewStyle
  }

  private getSlideStyle = (slideParams, scale: [number, number]) => {
    const {
      width,
      height,
      scaleMode,
      backgroundColor,
      backgroundImage
    } = slideParams

    let slideStyle: React.CSSProperties

    const { clientWidth, clientHeight } = document.body
    const [scaleX, scaleY] = scale

    let translateX = (scaleX - 1) / 2
    let translateY = (scaleY - 1) / 2
    translateX += Math.max(0, (clientWidth - scaleX * width) / (2 * width))
    translateY += Math.max(0, (clientHeight - scaleY * height) / (2 * height))

    const translate = `translate(${translateX * 100}%, ${translateY * 100}%)`

    slideStyle  = {
      overflow: 'visible',
      width,
      height,
      transform: `${translate} scale(${scaleX}, ${scaleY})`
    }

    let backgroundStyle: React.CSSProperties | CSSStyleDeclaration = slideStyle
    if (scaleMode === 'scaleWidth' && screen.width <= 1024) {
      backgroundStyle = document.body.style
    }
    backgroundStyle.backgroundSize = 'cover'

    if (backgroundColor) {
      const rgb = backgroundColor.join()
      backgroundStyle.backgroundColor = `rgba(${rgb})`
    }
    if (backgroundImage) {
      backgroundStyle.backgroundImage = `url("${backgroundImage}")`
    }
    return slideStyle
  }

  private loadShareContent = () => {
    const { onLoadDisplay } = this.props
    const { shareInfo } = this.state
    onLoadDisplay(shareInfo, () => {
      console.log('share page need login...')
    }, () => {
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
      layersInfo
    } = this.props

    const { scale, showLogin, shareInfo } = this.state
    const loginPanel = showLogin ? <Login shareInfo={shareInfo} legitimateUser={this.handleLegitimateUser} /> : null

    let content = null
    let previewStyle = null
    if (display) {
      const { scale } = this.state
      const slideParams = JSON.parse(slide.config).slideParams
      previewStyle = this.getPreviewStyle(slideParams)
      const slideStyle = this.getSlideStyle(slideParams, scale)
      const layerItems =  Array.isArray(widgets) ? layers.map((layer) => {
        const widget = widgets.find((w) => w.id === layer.widgetId)
        const model = widget && widget.model
        const layerId = layer.id
        const { polling, frequency } = JSON.parse(layer.params)
        const { datasource, loading, interactId, renderType } = layersInfo[layerId]

        return (
          <LayerItem
            key={layer.id}
            pure={true}
            itemId={layerId}
            widget={widget}
            model={model}
            datasource={datasource}
            layer={layer}
            loading={loading}
            polling={polling}
            frequency={frequency}
            interactId={interactId}
            renderType={renderType}
            onGetChartData={this.getChartData}
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
      <div className={mainStyles.container}>
        <div className={styles.preview} style={previewStyle}>
          <Helmet title={title} />
          {content}
          {loginPanel}
        </div>
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
  layersInfo: makeSelectLayersInfo()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDisplay: (token, resolve, reject) => dispatch(loadDisplay(token, resolve, reject)),
    onLoadLayerData: (renderType, layerId, dataToken, requestParams) => dispatch(loadLayerData(renderType, layerId, dataToken, requestParams))
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
