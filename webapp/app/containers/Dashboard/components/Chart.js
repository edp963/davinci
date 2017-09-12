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
import classnames from 'classnames'

import TableChart from './TableChart'

import { TABLE_HEADER_HEIGHT, TABLE_PAGINATION_HEIGHT } from '../../../globalConstants'
import utilStyles from '../../../assets/less/util.less'
import styles from '../Dashboard.less'

export class Chart extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      tableWidth: 0,
      tableHeight: 0
    }
  }

  componentDidMount () {
    this.updateTableSize()
  }

  componentDidUpdate () {
    this.updateTableSize()
  }

  updateTableSize () {
    this.setState({
      tableWidth: this.refs.block.offsetWidth,
      tableHeight: this.refs.block.offsetHeight - TABLE_HEADER_HEIGHT - TABLE_PAGINATION_HEIGHT
    })
  }

  render () {
    const {
      id,
      data,
      loading,
      chartInfo,
      chartParams,
      onTableSearch
    } = this.props

    const {
      tableWidth,
      tableHeight
    } = this.state

    const params = JSON.parse(chartParams.chart_params)
    const { dimensionColumns, metricColumns } = params

    const isTable = chartInfo.name === 'table'

    const chartClass = classnames({
      [utilStyles.hide]: isTable
    })

    const tableContent = isTable
      ? (
        <TableChart
          className={styles.tableBlock}
          data={data}
          loading={loading}
          dimensionColumns={dimensionColumns}
          metricColumns={metricColumns}
          width={tableWidth}
          height={tableHeight}
          onChange={onTableSearch}
          filterable
          sortable
        />
      ) : ''

    return (
      <div className={styles.block} ref="block">
        <div className={`${styles.chartBlock} ${chartClass}`} id={`widget_${id}`} />
        {tableContent}
      </div>
    )
  }
}

Chart.propTypes = {
  id: PropTypes.string,
  w: PropTypes.number,  // eslint-disable-line
  h: PropTypes.number,  // eslint-disable-line
  data: PropTypes.object,
  loading: PropTypes.bool,
  chartInfo: PropTypes.object,
  chartParams: PropTypes.object,
  onTableSearch: PropTypes.func
}

export default Chart
