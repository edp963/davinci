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

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router'
import echarts from 'echarts/lib/echarts'

import Container from '../../components/Container'
import DashboardItemForm from './components/DashboardItemForm'
import Workbench from '../Widget/Workbench'
import DashboardItem from './components/DashboardItem'
import DashboardItemFilters from './components/DashboardItemFilters'
import SharePanel from '../../components/SharePanel'
import { Responsive, WidthProvider } from 'react-grid-layout'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Button from 'antd/lib/button'
import Modal from 'antd/lib/modal'
import Breadcrumb from 'antd/lib/breadcrumb'
import Popover from 'antd/lib/popover'
import Icon from 'antd/lib/icon'
import Dropdown from 'antd/lib/dropdown'
import Menu from 'antd/lib/menu'

import widgetlibs from '../../assets/json/widgetlib'
import { promiseDispatcher } from '../../utils/reduxPromisation'
import { loadDashboards, loadDashboardDetail, addDashboardItem, editDashboardItem, editDashboardItems, deleteDashboardItem, clearCurrentDashboard } from './actions'
import { makeSelectDashboards, makeSelectCurrentDashboard, makeSelectCurrentItems, makeSelectCurrentDatasources, makeSelectCurrentItemsLoading, makeSelectCurrentItemsQueryParams } from './selectors'
import { loadWidgets } from '../Widget/actions'
import { loadBizlogics, loadBizdatas, loadBizdatasFromItem } from '../Bizlogic/actions'
import { makeSelectWidgets } from '../Widget/selectors'
import { makeSelectBizlogics } from '../Bizlogic/selectors'
import { makeSelectLoginUser } from '../App/selectors'
import chartOptionsGenerator from '../Widget/chartOptionsGenerator'
import { initializePosition, changePosition, diffPosition } from './components/localPositionOperator'
import { DEFAULT_THEME_COLOR } from '../../globalConstants'

import utilStyles from '../../assets/less/util.less'
import widgetStyles from '../Widget/Widget.less'
import styles from './Dashboard.less'

const ResponsiveReactGridLayout = WidthProvider(Responsive)

export class Grid extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
      mounted: false,

      localPositions: [],
      modifiedPositions: false,
      editPositionSign: false,

      dashboardItemFormType: '',
      dashboardItemFormVisible: false,
      dashboardItemFormStep: 0,
      modalLoading: false,
      selectedWidget: 0,
      triggerType: 'manual',

      workbenchDashboardItem: 0,
      workbenchWidget: null,
      workbenchVisible: false,

      filtersVisible: false,
      filtersDashboardItem: 0,
      filtersKeys: null,
      filtersTypes: null
    }
  }

  componentWillMount () {
    const {
      onLoadDashboards,
      onLoadWidgets,
      onLoadBizlogics,
      onLoadDashboardDetail,
      params,
      loginUser
    } = this.props
    this.charts = {}

    if (loginUser.admin) {
      onLoadBizlogics()
    }

    onLoadDashboards()
    onLoadWidgets()
    onLoadDashboardDetail(params.id)
  }

  componentWillReceiveProps (nextProps) {
    const {
      loginUser,
      currentDashboard,
      currentItems,
      params
    } = nextProps
    const { onLoadDashboardDetail } = this.props
    const { modifiedPositions } = this.state

    if (currentItems) {
      const localPositions = initializePosition(loginUser, currentDashboard, currentItems)
      if (!modifiedPositions) {
        this.state.modifiedPositions = localPositions.map(item => Object.assign({}, item))
      }
      this.state.localPositions = localPositions
    }

    if (params.id !== this.props.params.id) {
      onLoadDashboardDetail(params.id)
    }
  }

  componentDidMount () {
    this.setState({ mounted: true })
  }

  componentWillUnmount () {
    Object.keys(this.charts).forEach(k => {
      this.charts[k].dispose()
    })
    this.props.onClearCurrentDashboard()
  }

  getChartData = (renderType, itemId, widgetId, queryParams) => {
    const {
      widgets,
      currentItemsQueryParams,
      onLoadBizdatasFromItem
    } = this.props
    const widget = widgets.find(w => w.id === widgetId)
    const chartInfo = widgetlibs.find(wl => wl.id === widget.widgetlib_id)

    const chartInstanceId = `widget_${itemId}`

    let currentChart = this.charts[chartInstanceId]

    if (chartInfo.name !== 'table') {
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

    const cachedQueryParams = currentItemsQueryParams[itemId]

    let filters = queryParams && queryParams.filters !== undefined ? queryParams.filters : cachedQueryParams.filters
    let params = queryParams && queryParams.params ? queryParams.params : cachedQueryParams.params
    let pagination = queryParams && queryParams.pagination ? queryParams.pagination : cachedQueryParams.pagination

    onLoadBizdatasFromItem(
      itemId,
      widget.flatTable_id,
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
    const chartOptions = chartOptionsGenerator({
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
    // setTimtout 中 setState 会被同步执行
    setTimeout(() => {
      const { currentItems, currentDatasources, widgets } = this.props
      const { localPositions, modifiedPositions } = this.state
      const newModifiedItems = changePosition(modifiedPositions, layout, (pos) => {
        const dashboardItem = currentItems.find(item => item.id === Number(pos.i))
        const widget = widgets.find(w => w.id === dashboardItem.widget_id)
        const data = currentDatasources[dashboardItem.id]
        const chartInfo = widgetlibs.find(wl => wl.id === widget.widgetlib_id)

        if (chartInfo.name !== 'table') {
          const chartInstanceId = `widget_${dashboardItem.id}`
          const chartInstance = this.charts[chartInstanceId]
          chartInstance.dispose()
          this.charts[chartInstanceId] = echarts.init(document.getElementById(chartInstanceId), 'default')
          this.renderChart(dashboardItem.id, widget, data ? data.dataSource : [], chartInfo)
        }
      })

      this.setState({
        modifiedPositions: newModifiedItems,
        editPositionSign: diffPosition(localPositions, newModifiedItems)
      })
    })
  }

  showAddDashboardItemForm = () => {
    this.setState({
      dashboardItemFormType: 'add',
      dashboardItemFormVisible: true
    })
  }

  showEditDashboardItemForm = (itemId) => () => {
    const dashboardItem = this.props.currentItems.find(c => c.id === itemId)

    this.setState({
      dashboardItemFormType: 'edit',
      dashboardItemFormVisible: true,
      selectedWidget: dashboardItem.widget_id,
      triggerType: dashboardItem.trigger_type
    }, () => {
      this.dashboardItemForm.setFieldsValue({
        id: dashboardItem.id,
        trigger_type: dashboardItem.trigger_type,
        trigger_params: dashboardItem.trigger_params
      })
    })
  }

  hideDashboardItemForm = () => {
    this.setState({
      modalLoading: false,
      dashboardItemFormVisible: false
    })
  }

  afterDashboardItemFormClose = () => {
    this.setState({
      selectedWidget: 0,
      triggerType: 'manual',
      dashboardItemFormStep: 0
    })
  }

  widgetSelect = (id) => () => {
    this.setState({
      selectedWidget: id
    })
  }

  triggerTypeSelect = (val) => {
    this.setState({
      triggerType: val
    })
  }

  changeDashboardItemFormStep = (sign) => () => {
    this.setState({
      dashboardItemFormStep: sign
    })
  }

  saveDashboardItem = () => {
    const { currentDashboard, currentItems } = this.props
    const { modifiedPositions, selectedWidget, dashboardItemFormType } = this.state

    const formdata = this.dashboardItemForm.getFieldsValue()

    const predictPosYArr = modifiedPositions.map(wi => wi.y + wi.h)

    const newItem = {
      widget_id: selectedWidget,
      dashboard_id: currentDashboard.id,
      trigger_type: formdata.trigger_type,
      trigger_params: `${formdata.trigger_params}`
    }

    this.setState({ modalLoading: true })

    if (dashboardItemFormType === 'add') {
      const positionInfo = {
        position_x: 0,
        position_y: predictPosYArr.length ? Math.max(...predictPosYArr) : 0,
        width: 4,
        length: 4
      }

      this.props.onAddDashboardItem(currentDashboard.id, Object.assign({}, newItem, positionInfo))
        .then(dashboardItem => {
          modifiedPositions.push({
            x: dashboardItem.position_x,
            y: dashboardItem.position_y,
            w: dashboardItem.width,
            h: dashboardItem.length,
            i: `${dashboardItem.id}`
          })
          this.hideDashboardItemForm()
        })
    } else {
      const dashboardItem = currentItems.find(item => item.id === Number(formdata.id))
      const modifiedDashboardItem = Object.assign({}, dashboardItem, newItem)

      this.props.onEditDashboardItem(modifiedDashboardItem, () => {
        this.getChartData('rerender', modifiedDashboardItem.id, modifiedDashboardItem.widget_id)
        this.hideDashboardItemForm()
      })
    }
  }

  editDashboardItemPositions = () => {
    const {
      loginUser,
      currentDashboard,
      currentItems,
      onEditDashboardItems
    } = this.props
    const { modifiedPositions } = this.state

    const changedItems = currentItems.map((item, index) => {
      const modifiedItem = modifiedPositions[index]
      return {
        id: item.id,
        widget_id: item.widget_id,
        dashboard_id: currentDashboard.id,
        position_x: modifiedItem.x,
        position_y: modifiedItem.y,
        width: modifiedItem.w,
        length: modifiedItem.h,
        trigger_type: item.trigger_type,
        trigger_params: item.trigger_params
      }
    })

    if (loginUser.admin) {
      onEditDashboardItems(changedItems, () => {
        this.setState({ editPositionSign: false })
      })
    } else {
      localStorage.setItem(`${loginUser.id}_${currentDashboard.id}_position`, JSON.stringify(modifiedPositions))
      this.setState({ editPositionSign: false })
    }
  }

  deleteItem = (id) => () => {
    this.props.onDeleteDashboardItem(id)
      .then(() => {
        const { modifiedPositions } = this.state
        modifiedPositions.splice(modifiedPositions.findIndex(mi => Number(mi.i) === id), 1)
        if (this.charts[`widget_${id}`]) {
          this.charts[`widget_${id}`].dispose()
        }
      })
  }

  showWorkbench = (itemId, widget) => () => {
    const dashboardItem = this.props.currentItems.find(c => c.id === itemId)

    this.setState({
      workbenchDashboardItem: dashboardItem.id,
      workbenchWidget: widget,
      workbenchVisible: true
    })
  }

  hideWorkbench = () => {
    this.setState({
      workbenchDashboardItem: 0,
      workbenchWidget: null,
      workbenchVisible: false
    })
  }

  onWorkbenchClose = () => {
    const dashboardItem = this.props.currentItems.find(item => item.id === this.state.workbenchDashboardItem)
    this.getChartData('rerender', dashboardItem.id, dashboardItem.widget_id)
    this.hideWorkbench()
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
    this.dashboardItemFilters.refs.wrappedComponent.refs.formWrappedComponent.resetTree()
  }

  doFilterQuery = (sql) => {
    const itemId = this.state.filtersDashboardItem
    const dashboardItem = this.props.currentItems.find(c => c.id === itemId)

    this.getChartData('refresh', itemId, dashboardItem.widget_id, {
      filters: sql
    })
    this.hideFiltersForm()
  }

  navDropdownClick = (e) => {
    this.props.router.push(`/visual/report/grid/${e.key}`)
  }

  render () {
    const {
      dashboards,
      currentDashboard,
      currentItems,
      currentDatasources,
      currentItemsLoading,
      loginUser,
      bizlogics,
      widgets
    } = this.props

    const {
      cols,
      mounted,
      localPositions,
      modifiedPositions,
      dashboardItemFormType,
      dashboardItemFormVisible,
      modalLoading,
      selectedWidget,
      triggerType,
      dashboardItemFormStep,
      editPositionSign,
      workbenchWidget,
      workbenchVisible,
      filtersVisible,
      filtersDashboardItem,
      filtersKeys,
      filtersTypes
    } = this.state

    let navDropdown = (<span></span>)
    let grids = ''

    if (dashboards) {
      const navDropdownItems = dashboards.map(d => (
        <Menu.Item key={d.id}>
          {d.name}
        </Menu.Item>
      ))

      navDropdown = (
        <Menu onClick={this.navDropdownClick}>
          {navDropdownItems}
        </Menu>
      )
    }

    if (widgets) {
      let layouts = {
        lg: []
      }
      let itemblocks = []

      localPositions.forEach((pos, index) => {
        layouts.lg.push({
          x: pos.x,
          y: pos.y,
          w: pos.w,
          h: pos.h,
          i: pos.i
        })

        const dashboardItem = currentItems[index]
        const modifiedPosition = modifiedPositions[index]
        const widget = widgets.find(w => w.id === dashboardItem.widget_id)
        const chartInfo = widgetlibs.find(wl => wl.id === widget.widgetlib_id)
        const data = currentDatasources[dashboardItem.id]
        const loading = currentItemsLoading[dashboardItem.id]

        itemblocks.push((
          <div key={pos.i}>
            <DashboardItem
              w={modifiedPosition ? modifiedPosition.w : 0}
              h={modifiedPosition ? modifiedPosition.h : 0}
              itemId={dashboardItem.id}
              widget={widget}
              chartInfo={chartInfo}
              data={data}
              loading={loading}
              triggerType={dashboardItem.trigger_type}
              triggerParams={dashboardItem.trigger_params}
              isAdmin={loginUser.admin}
              onGetChartData={this.getChartData}
              onRenderChart={this.renderChart}
              onShowEdit={this.showEditDashboardItemForm}
              onShowWorkbench={this.showWorkbench}
              onShowFiltersForm={this.showFiltersForm}
              onDeleteDashboardItem={this.deleteItem}
            />
          </div>
        ))
      })

      grids = (
        <ResponsiveReactGridLayout
          className="layout"
          style={{marginTop: '-28px'}}
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
    }

    const modalButtons = dashboardItemFormStep
      ? [
        <Button
          key="back"
          size="large"
          onClick={this.changeDashboardItemFormStep(0)}>
          上一步
        </Button>,
        <Button
          key="submit"
          size="large"
          type="primary"
          loading={modalLoading}
          disabled={modalLoading}
          onClick={this.saveDashboardItem}>
          保 存
        </Button>
      ]
      : [
        <Button
          key="forward"
          size="large"
          type="primary"
          disabled={!selectedWidget}
          onClick={this.changeDashboardItemFormStep(1)}>
          下一步
        </Button>
      ]

    let savePosButton = ''
    let addButton = ''
    let shareButton = ''

    if (editPositionSign) {
      savePosButton = (
        <Button
          size="large"
          style={{marginRight: '5px'}}
          onClick={this.editDashboardItemPositions}
        >
          保存位置修改
        </Button>
      )
    }

    if (loginUser.admin) {
      addButton = (
        <Button
          size="large"
          type="primary"
          icon="plus"
          style={{marginRight: '5px'}}
          onClick={this.showAddDashboardItemForm}
        >
          新 增
        </Button>
      )

      shareButton = currentDashboard
        ? (
          <Popover
            placement="bottomRight"
            content={<SharePanel id={currentDashboard.id} type="dashboard" />}
            trigger="click"
          >
            <Button
              size="large"
              type="primary"
              icon="share-alt"
            >
              分 享
            </Button>
          </Popover>
        )
        : ''
    }

    return (
      <Container>
        <Container.Title>
          <Row>
            <Col sm={12}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="/visual/report/dashboard">
                    Dashboard
                  </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <Dropdown overlay={navDropdown} trigger={['click']}>
                    <Link>
                      {currentDashboard && `${currentDashboard.name} `}
                      <Icon type="down" />
                    </Link>
                  </Dropdown>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
            <Col sm={12} className={utilStyles.textAlignRight}>
              {savePosButton}
              {addButton}
              {shareButton}
            </Col>
          </Row>
        </Container.Title>
        {grids}
        <div className={styles.gridBottom} />
        <Modal
          title={`${dashboardItemFormType === 'add' ? '新增' : '修改'} Widget`}
          wrapClassName="ant-modal-large"
          visible={dashboardItemFormVisible}
          footer={modalButtons}
          onCancel={this.hideDashboardItemForm}
          afterClose={this.afterDashboardItemFormClose}
        >
          <DashboardItemForm
            type={dashboardItemFormType}
            widgets={widgets || []}
            selectedWidget={selectedWidget}
            triggerType={triggerType}
            step={dashboardItemFormStep}
            onWidgetSelect={this.widgetSelect}
            onTriggerTypeSelect={this.triggerTypeSelect}
            ref={f => { this.dashboardItemForm = f }}
          />
        </Modal>
        <Modal
          title="Widget 详情"
          wrapClassName={`ant-modal-xlarge ${widgetStyles.workbenchWrapper}`}
          visible={workbenchVisible}
          onCancel={this.hideWorkbench}
          footer={false}
          maskClosable={false}
        >
          <Workbench
            type={workbenchVisible ? 'edit' : ''}
            widget={workbenchWidget}
            bizlogics={bizlogics || []}
            widgetlibs={widgetlibs}
            onClose={this.onWorkbenchClose}
            ref={f => { this.workbenchWrapper = f }}
          />
        </Modal>
        <Modal
          title="条件查询"
          wrapClassName="ant-modal-xlarge"
          visible={filtersVisible}
          onCancel={this.hideFiltersForm}
          footer={false}
        >
          <DashboardItemFilters
            loginUser={loginUser}
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

Grid.propTypes = {
  dashboards: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  currentDashboard: PropTypes.object,
  currentItems: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  currentDatasources: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  currentItemsLoading: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  currentItemsQueryParams: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  onLoadDashboards: PropTypes.func,
  onLoadDashboardDetail: PropTypes.func,
  onAddDashboardItem: PropTypes.func,
  onEditDashboardItem: PropTypes.func,
  onEditDashboardItems: PropTypes.func,
  onDeleteDashboardItem: PropTypes.func,
  widgets: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  bizlogics: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  loginUser: PropTypes.object,
  router: PropTypes.any,
  params: PropTypes.any,
  onLoadWidgets: PropTypes.func,
  onLoadBizlogics: PropTypes.func,
  onLoadBizdatas: PropTypes.func,
  onLoadBizdatasFromItem: PropTypes.func,
  onClearCurrentDashboard: PropTypes.func
}

const mapStateToProps = createStructuredSelector({
  dashboards: makeSelectDashboards(),
  currentDashboard: makeSelectCurrentDashboard(),
  currentItems: makeSelectCurrentItems(),
  currentDatasources: makeSelectCurrentDatasources(),
  currentItemsLoading: makeSelectCurrentItemsLoading(),
  currentItemsQueryParams: makeSelectCurrentItemsQueryParams(),
  widgets: makeSelectWidgets(),
  bizlogics: makeSelectBizlogics(),
  loginUser: makeSelectLoginUser()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadDashboards: () => promiseDispatcher(dispatch, loadDashboards),
    onLoadDashboardDetail: (id) => promiseDispatcher(dispatch, loadDashboardDetail, id),
    onAddDashboardItem: (id, item) => promiseDispatcher(dispatch, addDashboardItem, id, item),
    onEditDashboardItem: (item, resolve) => dispatch(editDashboardItem(item, resolve)),
    onEditDashboardItems: (items, resolve) => dispatch(editDashboardItems(items, resolve)),
    onDeleteDashboardItem: (id) => promiseDispatcher(dispatch, deleteDashboardItem, id),
    onLoadWidgets: () => promiseDispatcher(dispatch, loadWidgets),
    onLoadBizlogics: () => promiseDispatcher(dispatch, loadBizlogics),
    onLoadBizdatas: (id, sql, sorts, offset, limit) => promiseDispatcher(dispatch, loadBizdatas, id, sql, sorts, offset, limit),
    onLoadBizdatasFromItem: (itemId, id, sql, sorts, offset, limit) => promiseDispatcher(dispatch, loadBizdatasFromItem, itemId, id, sql, sorts, offset, limit),
    onClearCurrentDashboard: () => promiseDispatcher(dispatch, clearCurrentDashboard)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Grid)
