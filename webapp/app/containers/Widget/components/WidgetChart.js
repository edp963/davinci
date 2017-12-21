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

import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import Chart from '../../Dashboard/components/Chart'
import * as echarts from 'echarts/lib/echarts'

import { echartsOptionsGenerator } from './chartUtil'

import { ECHARTS_RENDERER } from '../../../globalConstants'
import utilStyles from '../../../assets/less/util.less'
import styles from '../Widget.less'

export class WidgetChart extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {

    }
  }

  componentDidMount () {
    this.renderOrDisposeChart(this.props)
  }

  componentDidUpdate () {
    this.renderOrDisposeChart(this.props)
  }

  renderOrDisposeChart = ({ data, chartInfo, chartParams }) => {
    if (this.props.chartInfo.renderer === ECHARTS_RENDERER) {
      if (this.chart) {
        this.chart.clear()
      } else {
        this.chart = echarts.init(document.getElementById('widget_commonChart'), 'default')
      }

      const chartOptions = echartsOptionsGenerator({
        dataSource: data.dataSource,
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
    } else {
      this.chart = undefined
    }
  }

  render () {
    const {
      loading,
      data,
      chartInfo,
      chartParams
    } = this.props

    const chartClass = {
      chart: styles.commonChart,
      table: styles.tableChart,
      container: styles.widgetChart
    }

    return (
      <Chart
        id="commonChart"
        w={0}
        h={0}
        title={chartParams.name}
        data={data}
        loading={loading}
        chartInfo={chartInfo}
        chartParams={chartParams}
        classNames={chartClass}
      />
    )
  }
}

WidgetChart.propTypes = {
  loading: PropTypes.bool,
  data: PropTypes.object,
  chartInfo: PropTypes.object,
  chartParams: PropTypes.object
}

export default WidgetChart
