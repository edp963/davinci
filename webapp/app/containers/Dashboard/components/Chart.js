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

import TableChart from './TableChart'
import ScorecardChart from './ScorecardChart'
import TextChart from './TextChart'

import { TABLE_HEADER_HEIGHT, TABLE_PAGINATION_HEIGHT } from '../../../globalConstants'

export class Chart extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      tableWidth: 0,
      tableHeight: 0,
      blockWidth: 0,
      blockHeight: 0
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
      tableHeight: this.refs.block.offsetHeight - TABLE_HEADER_HEIGHT - TABLE_PAGINATION_HEIGHT,
      blockWidth: this.refs.block.offsetWidth,
      blockHeight: this.refs.block.offsetHeight
    })
  }

  render () {
    const {
      id,
      data,
      loading,
      chartInfo,
      updateConfig,
      chartParams,
      classNames,
      updateParams,
      interactId,
      onCheckTableInteract,
      onDoTableInteract,
      currentBizlogicId
    } = this.props
    const {
      tableWidth,
      tableHeight,
      blockWidth,
      blockHeight
    } = this.state

    let chartContent
    if (chartInfo.renderer && chartInfo.renderer === 'echarts') {
      chartContent = <div className={classNames.chart} id={`widget_${id}`}></div>
    } else {
      switch (chartInfo.name) {
        case 'table':
          chartContent = (
            <TableChart
              id={id}
              className={classNames.table}
              data={data}
              loading={loading}
              chartParams={chartParams}
              updateConfig={updateConfig}
              updateParams={updateParams}
              currentBizlogicId={currentBizlogicId}
              width={tableWidth}
              height={tableHeight}
              interactId={interactId}
              onCheckInteract={onCheckTableInteract}
              onDoInteract={onDoTableInteract}
            />
          )
          break
        case 'scorecard':
          chartContent = (
            <ScorecardChart
              id={id}
              className={classNames.chart}
              data={data}
              loading={loading}
              chartParams={chartParams}
              width={blockWidth}
              height={blockHeight}
            />
          )
          break
        case 'text':
          chartContent = (
            <TextChart
              id={id}
              className={classNames.chart}
              data={data}
              loading={loading}
              chartParams={chartParams}
            />
          )
          break
      }
    }

    return (
      <div className={classNames.container} ref="block">
        {chartContent}
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
  updateConfig: PropTypes.any,
  chartParams: PropTypes.object,
  updateParams: PropTypes.array,
  classNames: PropTypes.object,
  interactId: PropTypes.string,
  onCheckTableInteract: PropTypes.func,
  onDoTableInteract: PropTypes.func,
  currentBizlogicId: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.number
  ])
}

export default Chart
