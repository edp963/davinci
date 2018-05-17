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
const Icon = require('antd/lib/icon')

const styles = require('../Dashboard.less')

interface IScorecardChartProps {
  id: string
  data: any
  loading: boolean
  className: string
  width: number
  height: number
  chartParams: any
}

export class ScorecardChart extends React.PureComponent<IScorecardChartProps, {}> {
  public static defaultProps = {
    chartParams: {}
  }

  private prettifyContent = (content) => {
    if (!isNaN(Number(content))) {
      const arr = content.split('.')
      arr[0] = arr[0].split('').reduceRight((formatted, str, index, oarr) => {
        formatted = index % 3 === 2 && index !== oarr.length - 1
          ? `,${str}${formatted}`
          : `${str}${formatted}`
        return formatted
      }, '')
      return arr.join('.')
    }

    return ''
  }

  public render () {
    const {
      id,
      data,
      loading,
      className,
      width,
      height,
      chartParams
    } = this.props

    const scorecardLengthRef = Math.min(width - 80, height)

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

    const titleSize = (scorecardLengthRef - 40) * 0.2 < 12 ? 12 : ((scorecardLengthRef - 40) * 0.15 < 12 ? 12 : (scorecardLengthRef - 40) * 0.15)
    const contentSize = (scorecardLengthRef - 40) * 0.6 < 32 ? 32 : ((scorecardLengthRef - 40) * 0.4 < 20 ? 20 : (scorecardLengthRef - 40) * 0.4)
    const scorecard = loading
      ? (
        <div className={styles.scorecard}>
          <div className={styles.scorecardContainer}>
            <Icon type="loading" />
          </div>
        </div>
      )
      : (
        <div className={styles.scorecard}>
          <div className={styles.scorecardContainer}>
            <p
              className={styles.scorecardTitle}
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
              className={styles.scorecardContent}
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
              className={styles.scorecardContent}
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

    return (
      <div className={className} id={`widget_${id}`}>
        {scorecard}
      </div>
    )
  }
}

export default ScorecardChart
