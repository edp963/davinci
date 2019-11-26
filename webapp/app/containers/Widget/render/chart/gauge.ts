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

import { IChartProps } from '../../components/Chart'
import { decodeMetricName } from '../../components/util'
import { EChartOption } from 'echarts'
import { getFormattedValue } from '../../components/Config/Format'

export default function (chartProps: IChartProps, drillOptions?: any) {
  const {
    width,
    height,
    data,
    cols,
    metrics,
    chartStyles
  } = chartProps

  const {
    axis,
    splitLine,
    gauge
  } = chartStyles

  const {
    radius,
    splitNumber,
    startAngle,
    endAngle,
    clockwise,
    prefix,
    suffix,
    showTitle,
    titleFontFamily,
    titleFontSize,
    titleColor,
    titleOffsetLeft,
    titleOffsetTop,
    showDetail,
    detailFontFamily,
    detailFontSize,
    detailColor,
    detailOffsetLeft,
    detailOffsetTop,
    showPointer,
    pointerLength,
    pointerWidth,
    customPointerColor,
    pointerColor,
    pointerBorderStyle,
    pointerBorderWidth,
    pointerBorderColor,
    axisLineSize,
    axisLineColor,
    showAxisTick,
    showAxisLabel,
    axisLabelDistance,
    axisLabelFontFamily,
    axisLabelFontSize,
    axisLabelColor,
    showSplitLine,
    splitLineLength,
    splitLineSize,
    splitLineStyle,
    splitLineColor
  } = gauge
  const max = gauge.max || 100

  let seriesObj = {}
  const seriesArr = []

  metrics.forEach((m) => {
    const decodedMetricName = decodeMetricName(m.name)
    seriesObj = {
      type: 'gauge',
      splitNumber,
      startAngle,
      endAngle,
      clockwise,
      max,
      radius: radius ? `${radius}%` : '75%',
      title: {
        show: showTitle,
        fontFamily: titleFontFamily,
        fontSize: titleFontSize,
        color: titleColor,
        offsetCenter: [
          titleOffsetLeft ? `${titleOffsetLeft}%` : 0,
          titleOffsetTop ? `${titleOffsetTop}%` : 0
        ]
      },
      detail: {
        show: showDetail,
        fontFamily: detailFontFamily,
        fontSize: detailFontSize,
        color: detailColor,
        offsetCenter: [
          detailOffsetLeft ? `${detailOffsetLeft}%` : 0,
          detailOffsetTop ? `${detailOffsetTop}%` : 0
        ],
        formatter: (value) => `${prefix}${getFormattedValue(Number(value) * 100 / max, m.format)}${suffix}`,
        // rich: {},
        // width: 240,
        // height: 240,
        // borderRadius: 120,
        // lineHeight: 240,
        // backgroundColor: '#05354a'
      },
      // animationDuration: 1000,
      // animationDurationUpdate: 1000,
      data: [{
        value: data.length ? data[0][`${m.agg}(${decodedMetricName})`] : 0,
        name: m.field.alias || decodedMetricName
      }],
      axisLine: {
        lineStyle: {
          width: axisLineSize,
          color: [
            [data.length ? data[0][`${m.agg}(${decodedMetricName})`] / max : 0, axisLineColor],
            [1, '#ddd']
          ]
        }
      },
      axisTick: {
        show: showAxisTick
      },
      axisLabel: {
        show: showAxisLabel,
        distance: axisLabelDistance,
        fontSize: axisLabelFontSize,
        fontFamily: axisLabelFontFamily,
        color: axisLabelColor
      },
      splitLine: {
        show: showSplitLine,
        length: splitLineLength,
        lineStyle: {
          color: splitLineColor,
          width: splitLineSize,
          type: splitLineStyle
        }
      },
      pointer: {
        show: showPointer,
        length: pointerLength ? `${pointerLength}%` : 0,
        width: pointerWidth
      },
      itemStyle: {
        color: customPointerColor ? pointerColor : 'auto',
        borderType: pointerBorderStyle,
        borderWidth: pointerBorderWidth,
        borderColor: pointerBorderColor
      }
    }
    seriesArr.push(seriesObj)
  })

  const tooltip: EChartOption.Tooltip = {
    trigger: 'item',
    formatter: '{b}: {c}'
  }

  return {
    tooltip,
    series: seriesArr
  }
}