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
import { EChartOption } from 'echarts'
import { decodeMetricName } from '../../components/util'
import { getFormattedValue } from '../../components/Config/Format'
const defaultTheme = require('assets/json/echartsThemes/default.project.json')
const defaultThemeColors = defaultTheme.theme.color

export default function (chartProps: IChartProps) {
  const {
    width,
    height,
    data,
    cols,
    metrics,
    chartStyles
  } = chartProps

  const {
    spec
  } = chartStyles

  const {

  } = spec

  const title = cols[0].name
  const agg = metrics[0].agg
  const metricName = decodeMetricName(metrics[0].name)

  const tooltip: EChartOption.Tooltip = {
    formatter (params: EChartOption.Tooltip.Format) {
      const { name, value, color } = params
      const tooltipLabels = []
      if (color) {
        tooltipLabels.push(`<span class="widget-tooltip-circle" style="background: ${color}"></span>`)
      }
      tooltipLabels.push(name)
      if (data) {
        tooltipLabels.push(': ')
        tooltipLabels.push(getFormattedValue(value as number, metrics[0].format))
      }
      return tooltipLabels.join('')
    }
  }

  return {
    tooltip,
    series: [{
      type: 'wordCloud',
      sizeRange: [12, 72],
      textStyle: {
        normal: {
          color () {
            return defaultThemeColors[Math.floor(Math.random() * defaultThemeColors.length)]
          }
        }
      },
      rotationStep: 90,
      data: data
        .filter((d) => !!d[title])
        .map((d) => ({
          name: d[title],
          value: d[`${agg}(${metricName})`]
        }))
    }]
  }
}
