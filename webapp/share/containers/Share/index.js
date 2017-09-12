/*-
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

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import echarts from 'echarts/lib/echarts'

import Container from '../../../app/components/Container'
import DashboardItem from '../../../app/containers/Dashboard/components/DashboardItem'
import DashboardItemFilters from '../../../app/containers/Dashboard/components/DashboardItemFilters'
import { Responsive, WidthProvider } from 'react-grid-layout'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Modal from 'antd/lib/modal'

import { promiseDispatcher } from '../../../app/utils/reduxPromisation'
import { getDashboard, getWidget, getResultset, setIndividualDashboard } from './actions'
import { makeSelectItems } from './selectors'
import chartOptionsGenerator from '../../../app/containers/Widget/chartOptionsGenerator'

import styles from '../../../app/containers/Dashboard/Dashboard.less'

import widgetlibs from '../../../app/assets/json/widgetlib'

const ResponsiveReactGridLayout = WidthProvider(Responsive)

export class Share extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      mounted: false,
      type: '',
      shareInfo: '',
      title: '',

      widgets: [],

      modalLoading: false,

      filtersVisible: false,
      filtersDashboardItem: 0,
      filtersKeys: null,
      filtersTypes: null
    }
    this.frequent = {}
  }

  componentWillMount () {
    const {
      onLoadDashboard,
      onLoadWidget,
      onSetIndividualDashboard
    } = this.props
    const qs = this.getQs(location.href.substr(location.href.indexOf('?') + 1))
    this.state.type = qs.type
    this.state.shareInfo = qs.shareInfo
    this.charts = {}

    if (qs.type === 'dashboard') {
      onLoadDashboard(qs.shareInfo)
        .then(dashboard => {
          this.setState({
            title: dashboard.name
          })
          dashboard.widgets.forEach(w => {
            onLoadWidget(w.aesStr)
              .then(w => {
                this.setState({
                  widgets: this.state.widgets.concat(w)
                })
              })
          })
        })
    } else {
      onLoadWidget(qs.shareInfo)
        .then(w => {
          onSetIndividualDashboard(w.id, qs.shareInfo)
          this.setState({
            title: w.name,
            widgets: this.state.widgets.concat(w)
          })
        })
    }
  }

  componentDidMount () {
    this.setState({ mounted: true })
  }

  componentWillUnmount () {
    Object.keys(this.charts).forEach(k => {
      this.charts[k].dispose()
    })
    Object.keys(this.frequent).forEach(k => {
      clearInterval(this.frequent[k])
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

  renderChart = (renderType, dashboardItem, filters, params, sorts, offset, limit) =>
    new Promise((resolve) => {
      const widget = this.state.widgets.find(w => w.id === dashboardItem.widget_id)
      const chartInfo = widgetlibs.find(wl => wl.id === widget.widgetlib_id)

      const domId = `widget_${dashboardItem.id}`
      let currentChart = this.charts[domId]
      if (chartInfo.type !== 'table') {
        switch (renderType) {
          case 'rerender':
            if (currentChart) {
              currentChart.dispose()
            }
            currentChart = echarts.init(document.getElementById(domId), 'default')
            this.charts[domId] = currentChart
            currentChart.showLoading('default', { color: '#8BC34A' })
            break
          case 'clear':
            currentChart.clear()
            currentChart.showLoading('default', { color: '#8BC34A' })
            break
          case 'refresh':
            currentChart.showLoading('default', { color: '#8BC34A' })
            break
          default:
            break
        }
      }

      const adhocAndFilters = {
        adHoc: widget.adhoc_sql,
        manualFilters: filters,
        params: params
      }

      this.props.onLoadResultset(dashboardItem.aesStr, adhocAndFilters, sorts, offset, limit)
        .then((resultset) => {
          resolve(resultset)

          if (chartInfo.type !== 'table') {
            const chartOptions = chartOptionsGenerator({
              dataSource: resultset.dataSource,
              chartInfo: chartInfo,
              chartParams: Object.assign({
                id: widget.id,
                name: widget.name,
                desc: widget.desc,
                flatTable_id: widget.flatTable_id,
                widgetlib_id: widget.widgetlib_id
              }, JSON.parse(widget.chart_params))
            })
            currentChart.setOption(chartOptions)
            currentChart.hideLoading()
          }
        })
    })

  setFrequent = (dashboardItem, filters, params, sorts, offset, limit) => {
    let intervalId = `widget_${dashboardItem.id}`
    let currentFrequent = this.frequent[intervalId]

    if (currentFrequent) {
      clearInterval(currentFrequent)
    }

    if (dashboardItem.trigger_type === 'frequent') {
      currentFrequent = setInterval(() => {
        this.renderChart('dynamic', dashboardItem, filters, params, sorts, offset, limit)
      }, Number(dashboardItem.trigger_params) * 1000)

      this.frequent[intervalId] = currentFrequent
    }
  }

  renderChartAndSetFrequent = (renderType, dashboardItem, filters, params, sorts, offset, limit) => {
    const promise = this.renderChart(renderType, dashboardItem, filters, params, sorts, offset, limit)
    this.setFrequent(dashboardItem, filters, params, sorts, offset, limit)
    return promise
  }

  onLayoutChange = (layout, layouts) => {
    // setTimtout 中 setState 会被同步执行
    setTimeout(() => {
      // const dashboardItem = this.props.currentItems.find(item => item.id === Number(pos.i))
      // this.renderChartAndSetFrequent('rerender', dashboardItem)
    })
  }

  showFiltersForm = (dashboardItem, keys, types) => () => {
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
    this.dashboardItemFilters.refs.wrappedComponent.refs.formWrappedComponent.resetTree()
  }

  doFilterQuery = (sql) => {
    this[`dashboardItem${this.state.filtersDashboardItem}`].onTableSearch(sql)
    this.hideFiltersForm()
  }

  render () {
    const {
      currentItems
    } = this.props

    const {
      title,
      cols,
      mounted,
      widgets,
      filtersVisible,
      filtersDashboardItem,
      filtersKeys,
      filtersTypes
    } = this.state

    let grids = ''

    let layouts = {
      lg: []
    }
    let itemblocks = []

    if (currentItems) {
      currentItems.forEach(item => {
        layouts.lg.push({
          x: item.position_x,
          y: item.position_y,
          w: item.width,
          h: item.length,
          i: `${item.id}`
        })

        const widget = widgets.find(w => w.id === item.widget_id)

        if (widget) {
          const chartInfo = widgetlibs.find(wl => wl.id === widget.widgetlib_id)

          itemblocks.push((
            <div key={item.id}>
              <DashboardItem
                item={item}
                w={item.width}
                h={item.length}
                widget={widget}
                chartInfo={chartInfo}
                isAdmin={false}
                onInitChart={this.renderChartAndSetFrequent}
                onRenderChart={this.renderChart}
                onShowFiltersForm={this.showFiltersForm}
                ref={f => { this[`dashboardItem${item.id}`] = f }}
              />
            </div>
          ))
        }
      })
    }

    if (widgets.length === currentItems.length) {
      grids = (
        <ResponsiveReactGridLayout
          className="layout"
          style={{marginTop: '-22px'}}
          rowHeight={30}
          margin={[20, 20]}
          cols={cols}
          layouts={layouts}
          onLayoutChange={this.onLayoutChange}
          measureBeforeMount={false}
          draggableHandle={`.${styles.move}`}
          useCSSTransforms={mounted}>
          {itemblocks}
        </ResponsiveReactGridLayout>
      )
    } else {
      grids = (
        <div className={styles.shareContentEmpty}>
          <h3>数据加载中……</h3>
        </div>
      )
    }

    return (
      <Container>
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
            ref={f => { this.dashboardItemFilters = f }}
          />
        </Modal>
      </Container>
    )
  }
}

Share.propTypes = {
  currentItems: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  onLoadDashboard: PropTypes.func,
  onLoadWidget: PropTypes.func,
  onLoadResultset: PropTypes.func,
  onSetIndividualDashboard: PropTypes.func
}

const mapStateToProps = createStructuredSelector({
  currentItems: makeSelectItems()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboard: (token) => promiseDispatcher(dispatch, getDashboard, token),
    onLoadWidget: (token) => promiseDispatcher(dispatch, getWidget, token),
    onLoadResultset: (token, sql, sortby, offset, limit) => promiseDispatcher(dispatch, getResultset, token, sql, sortby, offset, limit),
    onSetIndividualDashboard: (widgetId, token) => dispatch(setIndividualDashboard(widgetId, token))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Share)
