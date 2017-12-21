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

import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import * as echarts from 'echarts/lib/echarts'

import Container from '../../../app/components/Container'
import DashboardItem from '../../../app/containers/Dashboard/components/DashboardItem'
import FullScreenPanel from '../../../app/containers/Dashboard/components/fullScreenPanel/FullScreenPanel'
import DashboardItemFilters from '../../../app/containers/Dashboard/components/DashboardItemFilters'
import { Responsive, WidthProvider } from 'react-grid-layout'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Modal from 'antd/lib/modal'

import { getDashboard, getWidget, getResultset, setIndividualDashboard, loadWidgetCsv } from './actions'
import { makeSelectTitle, makeSelectWidgets, makeSelectItems, makeSelectDataSources, makeSelectLoadings, makeSelectItemQueryParams, makeSelectItemDownloadCsvLoadings } from './selectors'
import { echartsOptionsGenerator } from '../../../app/containers/Widget/components/chartUtil'
import { changePosition } from '../../../app/containers/Dashboard/components/localPositionUtil'
import { DEFAULT_THEME_COLOR, ECHARTS_RENDERER, GRID_COLS, USER_GRID_BREAKPOINTS } from '../../../app/globalConstants'

import styles from '../../../app/containers/Dashboard/Dashboard.less'

import widgetlibs from '../../../app/assets/json/widgetlib'
import Login from '../../components/Login/index'

const ResponsiveReactGridLayout = WidthProvider(Responsive)

export class Share extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      mounted: false,
      modifiedPositions: false,
      type: '',
      shareInfo: '',

      modalLoading: false,

      filtersVisible: false,
      filtersDashboardItem: 0,
      filtersKeys: null,
      filtersTypes: null,
      allowFullScreen: false,
      currentDataInFullScreen: {},
      isShowLogin: false
    }
    this.charts = {}
  }

  /**
   * object
   * {
   *  type: this.state.type,
   *  shareInfo: this.state.shareInfo
   * }
   * @param qs
   */
  loadShareContent = (qs) => {
    const {
      onLoadDashboard,
      onLoadWidget,
      onSetIndividualDashboard
    } = this.props
    if (qs.type === 'dashboard') {
      onLoadDashboard(qs.shareInfo, (dashboard) => {
        dashboard.widgets.forEach(w => {
          onLoadWidget(w.aesStr)
        })
      }, (err) => {
        console.log(err)
        this.setState({
          isShowLogin: true
        })
      })
    } else {
      onLoadWidget(qs.shareInfo, (w) => {
        onSetIndividualDashboard(w.id, qs.shareInfo)
      }, (err) => {
        console.log(err)
        this.setState({
          isShowLogin: true
        })
      })
    }
  }
  componentWillMount () {
    const qs = this.getQs(location.href.substr(location.href.indexOf('?') + 1))
    this.state.type = qs.type
    this.state.shareInfo = qs.shareInfo
    this.loadShareContent(qs)
  }

  componentDidMount () {
    this.setState({ mounted: true })
  }

  componentWillUpdate (nextProps) {
    const { currentItems } = nextProps
    if (currentItems) {
      if (!this.state.modifiedPositions) {
        this.state.modifiedPositions = currentItems.map(ci => ({
          x: ci.position_x,
          y: ci.position_y,
          w: ci.width,
          h: ci.length,
          i: `${ci.id}`
        }))
      }
    }
  }

  componentWillUnmount () {
    Object.keys(this.charts).forEach(k => {
      this.charts[k].dispose()
    })
  }

  getQs = (qs) => {
    const qsArr = qs.split('&')
    return qsArr.reduce((acc, str) => {
      const arr = str.split('=')
      acc[arr[0]] = arr[1]
      return acc
    }, {})
  }

  getChartData = (renderType, itemId, widgetId, queryParams) => {
    const {
      currentItems,
      widgets,
      itemQueryParams,
      onLoadResultset
    } = this.props

    const dashboardItem = currentItems.find(c => c.id === itemId)
    const widget = widgets.find(w => w.id === widgetId)
    const chartInfo = widgetlibs.find(wl => wl.id === widget.widgetlib_id)

    const chartInstanceId = `widget_${itemId}`

    let currentChart = this.charts[chartInstanceId]

    if (chartInfo.renderer === ECHARTS_RENDERER) {
      switch (renderType) {
        case 'rerender':
          if (currentChart) {
            currentChart.dispose()
          }

          currentChart = echarts.init(document.getElementById(chartInstanceId), 'default')
          this.charts[chartInstanceId] = currentChart
          currentChart.showLoading('default', { color: DEFAULT_THEME_COLOR })
          break
        case 'clear':
          currentChart.clear()
          currentChart.showLoading('default', { color: DEFAULT_THEME_COLOR })
          break
        case 'refresh':
          currentChart.showLoading('default', { color: DEFAULT_THEME_COLOR })
          break
        default:
          break
      }
    }

    const cachedQueryParams = itemQueryParams[itemId]

    let filters = queryParams && queryParams.filters !== undefined ? queryParams.filters : cachedQueryParams.filters
    let params = queryParams && queryParams.params ? queryParams.params : cachedQueryParams.params
    let pagination = queryParams && queryParams.pagination ? queryParams.pagination : cachedQueryParams.pagination

    onLoadResultset(
      itemId,
      dashboardItem.aesStr,
      {
        adHoc: widget.adhoc_sql,
        manualFilters: filters,
        params
      },
      pagination.sorts,
      pagination.offset,
      pagination.limit,
    )
  }

  renderChart = (itemId, widget, dataSource, chartInfo) => {
    const chartInstance = this.charts[`widget_${itemId}`]
    const chartOptions = echartsOptionsGenerator({
      dataSource: dataSource,
      chartInfo: chartInfo,
      chartParams: Object.assign({
        id: widget.id,
        name: widget.name,
        desc: widget.desc,
        flatTable_id: widget.flatTable_id,
        widgetlib_id: widget.widgetlib_id
      }, JSON.parse(widget.chart_params))
    })
    chartInstance.setOption(chartOptions)

    chartInstance.on('dataZoom', (dzParams) => {

    })

    chartInstance.hideLoading()
  }

  onLayoutChange = (layout, layouts) => {
    setTimeout(() => {
      const { currentItems, dataSources, widgets } = this.props
      const { modifiedPositions } = this.state
      const newModifiedItems = changePosition(modifiedPositions, layout, (pos) => {
        const dashboardItem = currentItems.find(item => item.id === Number(pos.i))
        const widget = widgets.find(w => w.id === dashboardItem.widget_id)
        const data = dataSources[dashboardItem.id]
        const chartInfo = widgetlibs.find(wl => wl.id === widget.widgetlib_id)

        if (chartInfo.renderer === ECHARTS_RENDERER) {
          const chartInstanceId = `widget_${dashboardItem.id}`
          const chartInstance = this.charts[chartInstanceId]
          chartInstance.dispose()
          this.charts[chartInstanceId] = echarts.init(document.getElementById(chartInstanceId), 'default')
          this.renderChart(dashboardItem.id, widget, data ? data.dataSource : [], chartInfo)
        }
      })

      this.setState({
        modifiedPositions: newModifiedItems
      })
    })
  }

  showFiltersForm = (itemId, keys, types) => () => {
    const dashboardItem = this.props.currentItems.find(c => c.id === itemId)

    this.setState({
      filtersVisible: true,
      filtersDashboardItem: dashboardItem.id,
      filtersKeys: keys,
      filtersTypes: types
    })
  }

  hideFiltersForm = () => {
    this.setState({
      filtersVisible: false,
      filtersDashboardItem: 0,
      filtersKeys: [],
      filtersTypes: []
    })
    this.dashboardItemFilters.resetTree()
  }

  doFilterQuery = (sql) => {
    const itemId = this.state.filtersDashboardItem
    const dashboardItem = this.props.currentItems.find(c => c.id === itemId)

    this.getChartData('clear', itemId, dashboardItem.widget_id, {
      filters: sql
    })
    this.hideFiltersForm()
  }

  downloadCsv = (itemId) => (token) => {
    const {
      currentItems,
      widgets,
      itemQueryParams,
      onLoadWidgetCsv
    } = this.props

    const dashboardItem = currentItems.find(c => c.id === itemId)
    const widget = widgets.find(w => w.id === dashboardItem.widget_id)

    const cachedQueryParams = itemQueryParams[itemId]

    let filters = cachedQueryParams.filters
    let params = cachedQueryParams.params

    onLoadWidgetCsv(
      itemId,
      token,
      {
        adHoc: widget.adhoc_sql,
        manualFilters: filters,
        params
      }
    )
  }
  visibleFullScreen = (currentChartData) => {
    const {allowFullScreen} = this.state
    if (currentChartData) {
      this.setState({
        currentDataInFullScreen: currentChartData
      })
    }
    this.setState({
      allowFullScreen: !allowFullScreen
    })
  }
  currentWidgetInFullScreen = (id) => {
    const {currentItems, dataSources, loadings, widgets} = this.props
    const { modifiedPositions } = this.state
    const item = currentItems.find(ci => ci.id === id)
    const modifiedPosition = modifiedPositions[currentItems.indexOf(item)]
    const widget = widgets.find(w => w.id === item.widget_id)
    const chartInfo = widgetlibs.find(wl => wl.id === widget.widgetlib_id)
    const data = dataSources[id]
    const loading = loadings[id]
    this.setState({
      currentDataInFullScreen: {
        w: modifiedPosition ? modifiedPosition.w : 0,
        h: modifiedPosition ? modifiedPosition.h : 0,
        itemId: id,
        widgetId: widget.id,
        widget: widget,
        chartInfo: chartInfo,
        data: data,
        loading: loading,
        onGetChartData: this.getChartData
      }
    })
  }
  handleLegitimateUser = () => {
    const {type, shareInfo} = this.state
    this.setState({
      isShowLogin: false
    }, () => {
      this.loadShareContent({type, shareInfo})
    })
  }

  render () {
    const {
      title,
      currentItems,
      dataSources,
      loadings,
      widgets,
      downloadCsvLoadings
    } = this.props

    const {
      mounted,
      modifiedPositions,
      filtersVisible,
      filtersDashboardItem,
      filtersKeys,
      isShowLogin,
      filtersTypes,
      allowFullScreen
    } = this.state

    let grids = ''
    let fullScreenComponent = ''
    let loginPanel = ''

    let layouts = {
      lg: []
    }
    let itemblocks = []

    if (currentItems && widgets) {
      if (widgets.length === currentItems.length) {
        currentItems.forEach((item, index) => {
          layouts.lg.push({
            x: item.position_x,
            y: item.position_y,
            w: item.width,
            h: item.length,
            i: `${item.id}`
          })

          const widget = widgets.find(w => w.id === item.widget_id)
          const data = dataSources[item.id]
          const loading = loadings[item.id]
          const modifiedPosition = modifiedPositions[index]
          const downloadCsvLoading = downloadCsvLoadings[item.id]

          if (widget) {
            const chartInfo = widgetlibs.find(wl => wl.id === widget.widgetlib_id)
            // FIXME onTurnOffInteract
            itemblocks.push((
              <div key={item.id}>
                <DashboardItem
                  w={modifiedPosition ? modifiedPosition.w : 0}
                  h={modifiedPosition ? modifiedPosition.h : 0}
                  itemId={item.id}
                  widget={widget}
                  chartInfo={chartInfo}
                  data={data}
                  loading={loading}
                  triggerType={item.trigger_type}
                  triggerParams={item.trigger_params}
                  isAdmin={false}
                  isShared
                  shareInfo={item.aesStr}
                  downloadCsvLoading={downloadCsvLoading}
                  onGetChartData={this.getChartData}
                  onRenderChart={this.renderChart}
                  onShowFiltersForm={this.showFiltersForm}
                  onDownloadCsv={this.downloadCsv}
                  onTurnOffInteract={() => {}}
                  onShowFullScreen={this.visibleFullScreen}
                />
              </div>
            ))
          }
        })

        grids = (
          <ResponsiveReactGridLayout
            className="layout"
            style={{marginTop: '-16px'}}
            rowHeight={30}
            margin={[20, 20]}
            breakpoints={USER_GRID_BREAKPOINTS}
            cols={GRID_COLS}
            layouts={layouts}
            onLayoutChange={this.onLayoutChange}
            measureBeforeMount={false}
            draggableHandle={`.${styles.title}`}
            useCSSTransforms={mounted}>
            {itemblocks}
          </ResponsiveReactGridLayout>
        )

        fullScreenComponent = (
          <FullScreenPanel
            widgets={widgets}
            currentDashboard={{ widgets: currentItems }}
            currentDatasources={dataSources}
            visible={allowFullScreen}
            isVisible={this.visibleFullScreen}
            onRenderChart={this.renderChart}
            currentDataInFullScreen={this.state.currentDataInFullScreen}
            onCurrentWidgetInFullScreen={this.currentWidgetInFullScreen}
          />
        )
      }
    } else {
      grids = (
        <div className={styles.shareContentEmpty}>
          <h3>数据加载中……</h3>
        </div>
      )

      fullScreenComponent = ''
    }
    loginPanel = isShowLogin ? <Login shareInfo={this.state.shareInfo} legitimateUser={this.handleLegitimateUser} /> : ''
    return (
      <Container>
        <Helmet title={title} />
        <Container.Title>
          <Row>
            <Col span={24}>
              <h2 className={styles.shareTitle}>{title}</h2>
            </Col>
          </Row>
        </Container.Title>
        {grids}
        <div className={styles.gridBottom} />
        <Modal
          title="条件查询"
          wrapClassName="ant-modal-xlarge"
          visible={filtersVisible}
          onCancel={this.hideFiltersForm}
          footer={false}
        >
          <DashboardItemFilters
            loginUser={null}
            itemId={filtersDashboardItem}
            keys={filtersKeys}
            types={filtersTypes}
            onQuery={this.doFilterQuery}
            wrappedComponentRef={f => { this.dashboardItemFilters = f }}
          />
        </Modal>
        {fullScreenComponent}
        {loginPanel}
      </Container>
    )
  }
}

Share.propTypes = {
  title: PropTypes.string,
  currentItems: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  widgets: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  dataSources: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  loadings: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  itemQueryParams: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  downloadCsvLoadings: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  onLoadDashboard: PropTypes.func,
  onLoadWidget: PropTypes.func,
  onLoadResultset: PropTypes.func,
  onSetIndividualDashboard: PropTypes.func,
  onLoadWidgetCsv: PropTypes.func
}

const mapStateToProps = createStructuredSelector({
  title: makeSelectTitle(),
  widgets: makeSelectWidgets(),
  currentItems: makeSelectItems(),
  dataSources: makeSelectDataSources(),
  loadings: makeSelectLoadings(),
  itemQueryParams: makeSelectItemQueryParams(),
  downloadCsvLoadings: makeSelectItemDownloadCsvLoadings()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboard: (token, resolve, reject) => dispatch(getDashboard(token, resolve, reject)),
    onLoadWidget: (token, resolve, reject) => dispatch(getWidget(token, resolve, reject)),
    onLoadResultset: (itemId, token, sql, sorts, offset, limit) => dispatch(getResultset(itemId, token, sql, sorts, offset, limit)),
    onSetIndividualDashboard: (widgetId, token) => dispatch(setIndividualDashboard(widgetId, token)),
    onLoadWidgetCsv: (itemId, token, sql, sorts, offset, limit) => dispatch(loadWidgetCsv(itemId, token, sql, sorts, offset, limit))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Share)
