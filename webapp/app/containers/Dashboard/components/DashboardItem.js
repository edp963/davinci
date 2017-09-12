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

import React, { PropTypes, PureComponent } from 'react'
import Animate from 'rc-animate'

import DashboardItemControlPanel from './DashboardItemControlPanel'
import DashboardItemControlForm from './DashboardItemControlForm'
import SharePanel from '../../../components/SharePanel'

import Chart from './Chart'
import Icon from 'antd/lib/icon'
import Tooltip from 'antd/lib/tooltip'
import Popconfirm from 'antd/lib/popconfirm'
import Popover from 'antd/lib/popover'

import styles from '../Dashboard.less'

export class DashboardItem extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      controlPanelVisible: false
    }
  }

  componentDidMount () {
    const {
      itemId,
      widget,
      triggerType,
      triggerParams,
      onGetChartData
    } = this.props

    onGetChartData('rerender', itemId, widget.id)

    this.setFrequent(this.props)
  }

  componentWillUpdate (nextProps) {
    const {
      itemId,
      widget,
      data,
      chartInfo,
      triggerType,
      triggerParams,
      onRenderChart
    } = nextProps

    if (data && data !== this.props.data && chartInfo.name !== 'table') {
      onRenderChart(itemId, widget, data.dataSource, chartInfo)
    }

    if (triggerType !== this.props.triggerType) {
      this.setFrequent(nextProps)
    }
  }

  componentWillUnmount () {
    clearInterval(this.frequent)
  }

  setFrequent = (props) => {
    const {
      triggerType,
      triggerParams,
      itemId,
      widget,
      onGetChartData
    } = props

    if (triggerType === 'frequent') {
      this.frequent = setInterval(() => {
        onGetChartData('dynamic', itemId, widget.id)
      }, Number(triggerParams) * 1000)
    } else {
      clearInterval(this.frequent)
    }
  }

  onSyncBizdatas = () => {
    const {
      itemId,
      widget,
      onGetChartData
    } = this.props

    onGetChartData('refresh', itemId, widget.id)
  }

  onTableSearch = (queryParams) =>
    this.onSearch('refresh', queryParams)

  onControlSearch = (queryParams) =>
    this.onSearch('rerender', queryParams)

  onSearch = (renderType, queryParams) => {
    const {
      itemId,
      widget,
      onGetChartData
    } = this.props

    onGetChartData(renderType, itemId, widget.id, queryParams)
  }

  toggleControlPanel = () => {
    this.setState({
      controlPanelVisible: !this.state.controlPanelVisible
    })
  }

  render () {
    const {
      w,
      h,
      itemId,
      widget,
      chartInfo,
      data,
      loading,
      isAdmin,
      onShowEdit,
      onShowWorkbench,
      onShowFiltersForm,
      onDeleteDashboardItem
    } = this.props

    const {
      controlPanelVisible
    } = this.state

    let editButton = ''
    let widgetButton = ''
    let deleteButton = ''

    if (isAdmin) {
      editButton = (
        <Tooltip title="基本信息">
          <Icon type="edit" onClick={onShowEdit(itemId)} />
        </Tooltip>
      )
      widgetButton = (
        <Tooltip title="Widget信息">
          <Icon type="setting" onClick={onShowWorkbench(itemId, widget)} />
        </Tooltip>
      )
      deleteButton = (
        <Popconfirm
          title="确定删除？"
          placement="bottom"
          onConfirm={onDeleteDashboardItem(itemId)}
        >
          <Tooltip title="删除">
            <Icon type="delete" />
          </Tooltip>
        </Popconfirm>
      )
    }

    const controls = widget.query_params
      ? JSON.parse(widget.query_params).filter(c => c.type)
      : []
    const controlPanelHandle = controls.length
      ? (
        <Tooltip title="选择参数">
          <Icon
            className={styles.control}
            type={controlPanelVisible ? 'up-square-o' : 'down-square-o'}
            onClick={this.toggleControlPanel}
          />
        </Tooltip>
      ) : ''

    const controlPanelTransitionName = {
      enter: styles.controlPanelEnter,
      enterActive: styles.controlPanelEnterActive,
      leave: styles.controlPanelLeave,
      leaveActive: styles.controlPanelLeaveActive
    }

    return (
      <div className={styles.gridItem}>
        <h4 className={styles.title}>
          {controlPanelHandle}
          {widget.name}
          <Popover placement="bottom" content={<p className={styles.descPanel}>{widget.desc}</p>}>
            <Icon className={styles.desc} type="question-circle-o" />
          </Popover>
        </h4>
        <div className={styles.tools}>
          <Tooltip title="移动">
            <i className={`${styles.move} iconfont icon-move1`} />
          </Tooltip>
          {editButton}
          {widgetButton}
          <Tooltip title="条件查询">
            <Icon type="search" onClick={onShowFiltersForm(itemId, data && data.keys ? data.keys : [], data && data.types ? data.types : [])} />
          </Tooltip>
          <Tooltip title="同步数据">
            <Icon type="reload" onClick={this.onSyncBizdatas} />
          </Tooltip>
          <Tooltip title="分享">
            <Popover placement="bottomRight" content={<SharePanel id={widget.id} type="widget" />} trigger="click">
              <Icon type="share-alt" />
            </Popover>
          </Tooltip>
          {deleteButton}
        </div>
        <Animate
          showProp="show"
          transitionName={controlPanelTransitionName}
        >
          <DashboardItemControlPanel show={controlPanelVisible}>
            <DashboardItemControlForm
              controls={controls}
              onSearch={this.onControlSearch}
              onHide={this.toggleControlPanel}
            />
          </DashboardItemControlPanel>
        </Animate>
        <Chart
          id={`${itemId}`}
          w={w}
          h={h}
          data={data || {}}
          loading={loading}
          chartInfo={chartInfo}
          chartParams={widget}
          onTableSearch={this.onTableSearch}
        />
      </div>
    )
  }
}

DashboardItem.propTypes = {
  w: PropTypes.number,
  h: PropTypes.number,
  itemId: PropTypes.number,
  widget: PropTypes.object,
  chartInfo: PropTypes.object,
  data: PropTypes.object,
  loading: PropTypes.bool,
  triggerType: PropTypes.string,
  triggerParams: PropTypes.string,
  isAdmin: PropTypes.bool,
  onGetChartData: PropTypes.func,
  onRenderChart: PropTypes.func,
  onShowEdit: PropTypes.func,
  onShowWorkbench: PropTypes.func,
  onShowFiltersForm: PropTypes.func,
  onDeleteDashboardItem: PropTypes.func
}

export default DashboardItem
