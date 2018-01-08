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

import React, { PropTypes, PureComponent } from 'react'

import TableChart from '../../Dashboard/components/TableChart'
import SegmentControl from '../../../components/SegmentControl/index'
import WidgetChart from './WidgetChart'
import Icon from 'antd/lib/icon'
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'

import { TABLE_HEADER_HEIGHT, TABLE_PAGINATION_HEIGHT } from '../../../globalConstants'
import styles from '../Widget.less'

export class SplitView extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      tableInitiate: false,
      chartInitiate: false,
      tableWidth: 0,
      tableHeight: 0,

      loading: false
    }
  }

  componentDidMount () {
    this.setState({
      tableWidth: this.refs.tableContainer.offsetHeight,
      tableHeight: this.refs.tableContainer.offsetHeight - TABLE_HEADER_HEIGHT - TABLE_PAGINATION_HEIGHT
    })
  }

  componentWillUpdate (props) {
    this.state.tableInitiate = !!props.data
  }

  sengmentControlChange = (val) => {
    this.setState({
      chartInitiate: /chartView$/.test(val)
    })
  }

  saveWidget = () => {
    this.setState({ loading: true })
    this.props.onSaveWidget()
      .then(() => {
        this.setState({ loading: false })
      })
      .catch(() => {
        this.setState({ loading: false })
      })
  }

  render () {
    const {
      data,
      chartInfo,
      chartParams,
      updateParams,
      tableLoading,
      adhocSql,
      updateConfig,
      currentBizlogicId,
      onAdhocSqlInputChange,
      onAdhocSqlQuery
    } = this.props

    const {
      tableInitiate,
      chartInitiate,
      tableWidth,
      tableHeight,
      loading
    } = this.state

    const tableContent = tableInitiate || tableLoading
      ? (
        <TableChart
          data={data || {}}
          loading={tableLoading}
          width={tableWidth}
          height={tableHeight}
          filterable={false}
          sortable={false}
        />
      )
      : (
        <div className={styles.containerEmpty}>
          <h3>
            <Icon type="select" /> 请选择 Bizlogic 查看数据列表
          </h3>
        </div>
      )
    const chartContent = data && chartInfo && chartInitiate
      ? (
        <WidgetChart
          loading={tableLoading}
          data={data || {}}
          chartInfo={chartInfo}
          updateConfig={updateConfig}
          chartParams={chartParams}
          currentBizlogicId={currentBizlogicId}
          updateParams={updateParams}
        />
      )
      : (
        <div className={styles.containerEmpty}>
          <h3>
            <Icon type="select" /> 请选择 Bizlogic 和 Widget 类型查看图表
          </h3>
        </div>
      )

    return (
      <div className={styles.splitView}>
        <div className={styles.splitViewBody}>
          <SegmentControl onChange={this.sengmentControlChange}>
            <SegmentControl.SegmentPane
              tab={<i className="iconfont icon-table" />}
              key="tableView"
            >
              <div className={styles.tableContainer} ref="tableContainer">
                {tableContent}
              </div>
            </SegmentControl.SegmentPane>
            <SegmentControl.SegmentPane
              tab={<i className="iconfont icon-chart-bar" />}
              key="chartView"
            >
              {chartContent}
            </SegmentControl.SegmentPane>
          </SegmentControl>
        </div>
        <div className={styles.splitViewFooter}>
          <div className={styles.sqlInput}>
            <Input
              size="large"
              placeholder="Write Query SQL Here"
              value={adhocSql}
              onChange={onAdhocSqlInputChange}
              onPressEnter={onAdhocSqlQuery}
              addonAfter={
                <Icon
                  className={styles.runSql}
                  type="play-circle-o"
                  onClick={onAdhocSqlQuery}
                />
              }
            />
          </div>
          <Button
            type="primary"
            loading={loading}
            disabled={loading}
            onClick={this.saveWidget}
          >
            保存并退出
          </Button>
        </div>
      </div>
    )
  }
}

SplitView.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  chartInfo: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object
  ]),
  currentBizlogicId: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.number
  ]),
  chartParams: PropTypes.object,
  updateParams: PropTypes.array,
  updateConfig: PropTypes.any,
  tableLoading: PropTypes.bool,
  adhocSql: PropTypes.string,
  onSaveWidget: PropTypes.func,
  onAdhocSqlInputChange: PropTypes.func,
  onAdhocSqlQuery: PropTypes.func
}

export default SplitView
