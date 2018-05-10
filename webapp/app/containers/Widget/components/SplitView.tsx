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

import TableChart from '../../Dashboard/components/TableChart'
import SegmentControl from '../../../components/SegmentControl/index'
import WidgetChart from './WidgetChart'

const Icon = require('antd/lib/icon')
const Button = require('antd/lib/button')
const Input = require('antd/lib/input')

import { TABLE_HEADER_HEIGHT, TABLE_PAGINATION_HEIGHT } from '../../../globalConstants'
const styles = require('../Widget.less')

interface ISplitViewProps {
  data: object,
  chartInfo: object,
  currentBizlogicId: number,
  chartParams: object,
  updateParams: any[],
  updateConfig: any,
  tableLoading: boolean,
  adhocSql: string,
  onSaveWidget: () => Promise<any>,
  onAdhocSqlInputChange: (event: any) => void,
  onAdhocSqlQuery: () => void,
  onTextEditorChange: (content: any) => void
}

interface ISplitViewStates {
  tableInitiate: boolean,
  chartInitiate: boolean,
  tableWidth: number,
  tableHeight: number,
  loading: boolean
}

export class SplitView extends React.PureComponent<ISplitViewProps, ISplitViewStates> {
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

  private tableContainer: HTMLDivElement

  public componentDidMount () {
    this.setState({
      tableWidth: this.tableContainer.offsetHeight,
      tableHeight: this.tableContainer.offsetHeight - TABLE_HEADER_HEIGHT - TABLE_PAGINATION_HEIGHT
    })
  }

  public componentWillReceiveProps (props) {
    this.setState({
      tableInitiate: !!props.data
    })
  }

  private sengmentControlChange = (val) => {
    this.setState({
      chartInitiate: /chartView$/.test(val)
    })
  }

  private saveWidget = () => {
    this.setState({ loading: true })
    this.props.onSaveWidget()
      .then(() => {
        this.setState({ loading: false })
      })
      .catch(() => {
        this.setState({ loading: false })
      })
  }

  public render () {
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
      onAdhocSqlQuery,
      onTextEditorChange
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
          onTextEditorChange={onTextEditorChange}
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
              <div className={styles.tableContainer} ref={(f) => {this.tableContainer = f}}>
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

export default SplitView
