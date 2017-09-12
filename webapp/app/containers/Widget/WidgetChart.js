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
import classnames from 'classnames'

import Table from 'antd/lib/table'
import echarts from 'echarts/lib/echarts'

import chartOptionsGenerator from './chartOptionsGenerator'

import { TABLE_HEADER_HEIGHT, COLUMN_WIDTH, TABLE_PAGINATION_HEIGHT } from '../../globalConstants'
import utilStyles from '../../assets/less/util.less'
import styles from './Widget.less'

export class WidgetChart extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      tableWidth: 0,
      tableHeight: 0
    }
  }

  componentDidMount () {
    this.chart = echarts.init(document.getElementById('commonChart'), 'default')
    this.renderChart(this.props)
    this.setState({
      tableWidth: this.refs.widgetChart.offsetHeight,
      tableHeight: this.refs.widgetChart.offsetHeight - TABLE_HEADER_HEIGHT - TABLE_PAGINATION_HEIGHT
    })
  }

  componentWillUpdate (nextProps) {
    this.renderChart(nextProps)
  }

  renderChart = ({ dataSource, chartInfo, chartParams }) => {
    this.chart.clear()
    if (chartInfo.name !== 'table') {
      const chartOptions = chartOptionsGenerator({
        dataSource,
        chartInfo,
        chartParams
      })

      switch (chartInfo.name) {
        case 'line':
        case 'bar':
        case 'scatter':
        case 'area':
          if (chartOptions.xAxis && chartOptions.series) {
            this.chart.setOption(chartOptions)
          }
          break
        default:
          if (chartOptions.series) {
            this.chart.setOption(chartOptions)
          }
          break
      }
    }
  }

  render () {
    const {
      dataSource,
      chartInfo
    } = this.props

    const {
      tableWidth,
      tableHeight
    } = this.state

    const columnKeys = dataSource.length && Object.keys(dataSource[0])
    const columns = columnKeys
      ? Object.keys(dataSource[0])
          .filter(k => typeof dataSource[0][k] !== 'object' && k !== 'antDesignTableId')
          .map(k => ({
            title: k.toUpperCase(),
            dataIndex: k,
            key: k,
            width: COLUMN_WIDTH
          }))
      : []

    const predictColumnsWidth = columnKeys && columnKeys.length * COLUMN_WIDTH
    const tableWidthObj = predictColumnsWidth > tableWidth
      ? { x: predictColumnsWidth }
      : null
    const tableSize = Object.assign({}, tableWidthObj, { y: tableHeight })

    const tableClass = classnames({
      [utilStyles.hide]: chartInfo.name !== 'table'
    })
    const chartClass = classnames({
      [styles.invisible]: chartInfo.name === 'table'
    })

    return (
      <div className={styles.widgetChart} ref="widgetChart">
        <Table
          className={`${styles.tableChart} ${tableClass}`}
          dataSource={dataSource}
          rowKey="antDesignTableId"
          columns={columns}
          scroll={tableSize}
          bordered
        />
        <div id="commonChart" className={`${styles.commonChart} ${chartClass}`}></div>
      </div>
    )
  }
}

WidgetChart.propTypes = {
  dataSource: PropTypes.array,
  chartInfo: PropTypes.object,
  chartParams: PropTypes.object   // eslint-disable-line
}

export default WidgetChart
