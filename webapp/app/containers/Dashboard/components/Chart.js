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
import Icon from 'antd/lib/icon'

import { TABLE_HEADER_HEIGHT, TABLE_PAGINATION_HEIGHT } from '../../../globalConstants'
import styles from '../Dashboard.less'

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

  prettifyContent = (content) => {
    if (!isNaN(Number(content))) {
      let arr = content.split('.')
      arr[0] = arr[0].split('').reduceRight((formatted, str, index, oarr) => {
        if (index % 3 === 2 && index !== oarr.length - 1) {
          formatted = `,${str}${formatted}`
        } else {
          formatted = `${str}${formatted}`
        }
        return formatted
      }, '')
      return arr.join('.')
    }

    return ''
  }

  render () {
    const {
      id,
      title,
      data,
      loading,
      chartInfo,
      updateInfo,
      chartParams,
      classNames,
      interactIndex,
      onCheckTableInteract,
      onDoTableInteract,
      updateParams
    } = this.props

    const {
      tableWidth,
      tableHeight,
      blockWidth,
      blockHeight
    } = this.state

    // FIXME
    const textLengthRef = Math.min(blockWidth - 80, blockHeight)

    let header = ''
    let prefixHeader = ''
    let suffixHeader = ''

    let content = ''
    let prefixContent = ''
    let suffixContent = ''

    let footer = ''
    let prefixFooter = ''
    let suffixFooter = ''

    if (data.dataSource && data.dataSource.length) {
      header = this.prettifyContent(data.dataSource[0][chartParams['metricsHeader']])
      prefixHeader = chartParams['prefixHeader']
      suffixHeader = chartParams['suffixHeader']

      content = this.prettifyContent(data.dataSource[0][chartParams['metricsContent']])
      prefixContent = chartParams['prefixContent']
      suffixContent = chartParams['suffixContent']

      footer = this.prettifyContent(data.dataSource[0][chartParams['metricsFooter']])
      prefixFooter = chartParams['prefixFooter']
      suffixFooter = chartParams['suffixFooter']
    }
    // FIXME
    const titleSize = (textLengthRef - 40) * 0.2 < 12 ? 12 : ((textLengthRef - 40) * 0.15 < 12 ? 12 : (textLengthRef - 40) * 0.15)
    const contentSize = (textLengthRef - 40) * 0.6 < 32 ? 32 : ((textLengthRef - 40) * 0.4 < 20 ? 20 : (textLengthRef - 40) * 0.4)
    const textChart = chartInfo.name === 'text'
      ? loading
        ? (
          <div className={styles.textChart}>
            <div className={styles.textContainer}>
              <Icon type="loading" />
            </div>
          </div>
        )
        : (
          <div className={styles.textChart}>
            <div className={styles.textContainer}>
              <p
                className={styles.textChartTitle}
                style={{fontSize: `${titleSize}px`, lineHeight: `${titleSize}px`}}
              >
                <span
                  style={{fontSize: `${titleSize}px`, lineHeight: `${titleSize}px`}}
                >
                  {prefixHeader}
                </span>
                {header}
                <span
                  style={{fontSize: `${titleSize}px`, lineHeight: `${titleSize}px`}}
                >
                  {suffixHeader}
                </span>
              </p>
              <p
                className={styles.textChartContent}
                style={{fontSize: `${contentSize}px`, lineHeight: `${contentSize}px`}}
              >
                <span
                  style={{fontSize: `${titleSize}px`, lineHeight: `${titleSize}px`}}
                >
                  {prefixContent}
                </span>
                {content}
                <span
                  style={{fontSize: `${titleSize}px`, lineHeight: `${titleSize}px`}}
                >
                  {suffixContent}
                </span>
              </p>
              <p
                className={styles.textChartContent}
                style={{fontSize: `${titleSize}px`, lineHeight: `${titleSize}px`}}
              >
                <span
                  style={{fontSize: `${titleSize}px`, lineHeight: `${titleSize}px`}}
                >
                  {prefixFooter}
                </span>
                {footer}
                <span
                  style={{fontSize: `${titleSize}px`, lineHeight: `${titleSize}px`}}
                >
                  {suffixFooter}
                </span>
              </p>
            </div>
          </div>
        )
      : ''

    const chartContent = chartInfo.name === 'table'
      ? (
        <TableChart
          id={id}
          className={classNames.table}
          data={data}
          loading={loading}
          chartParams={chartParams}
          updateInfo={updateInfo}
          updateParams={updateParams}
          width={tableWidth}
          height={tableHeight}
          interactIndex={interactIndex}
          onCheckInteract={onCheckTableInteract}
          onDoInteract={onDoTableInteract}
        />
      ) : (
        <div className={classNames.chart} id={`widget_${id}`}>
          {textChart}
        </div>
      )

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
  title: PropTypes.string,
  data: PropTypes.object,
  loading: PropTypes.bool,
  chartInfo: PropTypes.object,
  updateInfo: PropTypes.any,
  chartParams: PropTypes.object,
  classNames: PropTypes.object,
  interactIndex: PropTypes.number,
  onCheckTableInteract: PropTypes.func,
  onDoTableInteract: PropTypes.func,
  updateParams: PropTypes.array
}

export default Chart
