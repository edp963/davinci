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

import React from 'react'
import { IChartProps } from './'
import { IWidgetMetric } from 'containers/Widget/components/Widget'
import { decodeMetricName, getTextWidth } from 'containers/Widget/components/util'
import { getFormattedValue } from '../Config/Format'

const styles = require('./Chart.less')

export class Scorecard extends React.PureComponent<IChartProps, {}> {

  private getMetricText = (metric: IWidgetMetric, visible: boolean) => {
    if (!metric || !visible) { return '' }
    const { data } = this.props
    const { name, agg, format } = metric
    const metricName = `${agg}(${decodeMetricName(name)})`
    const text = data.length ? getFormattedValue(data[0][metricName], format) : ''
    return text
  }

  private renderMetric = (
    text: string,
    fontFamily: string, fontSize: number, color: string,
    prefix: string, prefixFontFamily: string, prefixFontSize: number, prefixColor: string,
    suffix: string, suffixFontFamily: string, suffixFontSize: number, suffixColor: string
  ) => {

    const style: React.CSSProperties = {
      fontFamily,
      fontSize,
      color
    }
    const stylePrefix: React.CSSProperties = {
      fontFamily: prefixFontFamily,
      fontSize: prefixFontSize,
      color: prefixColor
    }
    const styleSuffix: React.CSSProperties = {
      fontFamily: suffixFontFamily,
      fontSize: suffixFontSize,
      color: suffixColor
    }

    return (
      <p
        className={styles.scorecardTitle}
      >
        <span style={stylePrefix}>{prefix}</span>
        <span style={style}>{text}</span>
        <span style={styleSuffix}>{suffix}</span>
      </p>
    )
  }

  private computeFontSize = (
    prefixHeader: string, headerText: string, suffixHeader: string,
    prefixContent: string, contentText: string, suffixContent: string,
    prefixFooter: string, footerText: string, suffixFooter: string): {
    titleFontSize: number
    contentFontSize: number
  } => {
    const hasHeader = prefixHeader || headerText || suffixHeader
    const hasContent = prefixContent || contentText || suffixContent
    const hasFooter = prefixFooter || footerText || suffixFooter

    const { width, height } = this.props
    const maxPartSize = 16

    const exactWidth = width * (width <= 150 ? 1 : (width <= 250 ? 0.9 : 0.7)) - 16 * 2
    const sumPartsW = Math.max(
      getTextWidth(prefixHeader + headerText + suffixHeader, '', '12px'),
      getTextWidth(prefixContent + suffixContent, '', '12px') + getTextWidth(contentText, '', '32px'),
      getTextWidth(prefixFooter + footerText + suffixFooter, '', '12px')
    )

    const exactHeight = height * (height <= 150 ? 1 : (height <= 250 ? 0.9 : 0.7)) - 40
    const sumPartsH = (hasHeader ? 3 : 0) + (hasContent ? 8 : 0) + (hasFooter ? 3 : 0)
    const gapH = 8
    const sumGapH = (hasHeader ? gapH : 0) + (hasContent ? gapH : 0) + (hasFooter ? gapH : 0)

    const exactPartSize = Math.min((exactWidth / sumPartsW * 3), ((exactHeight - sumGapH) / sumPartsH), maxPartSize)
    return {
      titleFontSize: Math.floor(3 * exactPartSize),
      contentFontSize: Math.floor(8 * exactPartSize)
    }
  }

  public render () {
    const {
      metrics,
      chartStyles
    } = this.props
    let metricHeader
    let metricContent
    let metricFooter
    if (metrics.length === 1) {
      metricContent = metrics[0]
    } else {
      [ metricHeader, metricContent, metricFooter ] = metrics
    }
    const { scorecard } = chartStyles
    const {
      headerVisible, headerFontFamily, headerColor,
      prefixHeader, prefixHeaderFontFamily, prefixHeaderColor,
      suffixHeader, suffixHeaderFontFamily, suffixHeaderColor,

      contentVisible, contentFontFamily, contentColor,
      prefixContent, prefixContentFontFamily, prefixContentColor,
      suffixContent, suffixContentFontFamily, suffixContentColor,

      footerVisible, footerFontFamily, footerColor,
      prefixFooter, prefixFooterFontFamily, prefixFooterColor,
      suffixFooter, suffixFooterFontFamily, suffixFooterColor,

      fontSizeFixed, fontSizeMain, fontSizeSub
    } = scorecard

    const headerText = this.getMetricText(metricHeader, headerVisible)
    const contentText = this.getMetricText(metricContent, contentVisible)
    const footerText = this.getMetricText(metricFooter, footerVisible)

    let titleFontSize = +fontSizeSub
    let contentFontSize = +fontSizeMain
    if (!fontSizeFixed) {
      ({ titleFontSize, contentFontSize } = this.computeFontSize(
        prefixHeader || '', headerText, suffixHeader || '',
        prefixContent || '', contentText, suffixContent || '',
        prefixFooter || '', footerText, suffixFooter || ''
      ))
    }

    return (
      <div className={styles.scorecard}>
        <div className={styles.scorecardContainer}>
          {this.renderMetric(headerText,
            headerFontFamily, titleFontSize, headerColor, prefixHeader, prefixHeaderFontFamily, titleFontSize, prefixHeaderColor,
            suffixHeader, suffixHeaderFontFamily, titleFontSize, suffixHeaderColor)}
          {this.renderMetric(contentText,
            contentFontFamily, contentFontSize, contentColor, prefixContent, prefixContentFontFamily, titleFontSize, prefixContentColor,
            suffixContent, suffixContentFontFamily, titleFontSize, suffixContentColor)}
          {this.renderMetric(footerText,
            footerFontFamily, titleFontSize, footerColor, prefixFooter, prefixFooterFontFamily, titleFontSize, prefixFooterColor,
            suffixFooter, suffixFooterFontFamily, titleFontSize, suffixFooterColor)}
        </div>
      </div>
    )
  }
}

export default Scorecard
