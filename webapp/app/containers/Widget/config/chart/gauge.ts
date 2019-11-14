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

import ChartTypes from './ChartTypes'
import {
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_DEFAULT_FONT_COLOR,
  PIVOT_DEFAULT_AXIS_LINE_COLOR,
  CHART_FUNNEL_LABEL_POSITIONS,
  CHART_SORT_MODES,
  CHART_ALIGNMENT_MODES,
  DEFAULT_FONT_STYLE,
  DEFAULT_ECHARTS_THEME
} from 'app/globalConstants'

import { IChartInfo } from 'app/containers/Widget/components/Widget'
const gauge: IChartInfo = {
  id: ChartTypes.Gauge,
  name: 'gauge',
  title: '仪表盘',
  icon: 'icon-gauge',
  coordinate: 'polar',
  rules: [{ dimension: 0, metric: 1 }],
  dimetionAxis: 'col',
  data: {
    cols: {
      title: '列',
      type: 'category'
    },
    rows: {
      title: '行',
      type: 'category'
    },
    metrics: {
      title: '指标',
      type: 'value'
    },
    filters: {
      title: '筛选',
      type: 'all'
    }
  },
  style: {
    gauge: {
      radius: 75,
      splitNumber: 10,
      startAngle: 225,
      endAngle: -45,
      clockwise: true,
      max: 100,
      prefix: '',
      suffix: '%',
      showTitle: true,
      titleFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      titleFontSize: '16',
      titleColor: PIVOT_DEFAULT_FONT_COLOR,
      titleOffsetLeft: 0,
      titleOffsetTop: -40,
      showDetail: true,
      detailFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      detailFontSize: '28',
      detailColor: PIVOT_DEFAULT_FONT_COLOR,
      detailOffsetLeft: 0,
      detailOffsetTop: 40,
      showPointer: true,
      pointerLength: 80,
      pointerWidth: 8,
      customPointerColor: false,
      pointerColor: DEFAULT_ECHARTS_THEME.color[0],
      pointerBorderStyle: 'solid',
      pointerBorderWidth: 0,
      pointerBorderColor: PIVOT_DEFAULT_AXIS_LINE_COLOR,
      axisLineSize: 30,
      axisLineColor: DEFAULT_ECHARTS_THEME.color[0],
      showAxisTick: true,
      showAxisLabel: true,
      axisLabelDistance: 5,
      axisLabelFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      axisLabelFontSize: '12',
      axisLabelColor: PIVOT_DEFAULT_FONT_COLOR,
      showSplitLine: true,
      splitLineLength: 30,
      splitLineSize: '1',
      splitLineStyle: 'solid',
      splitLineColor: PIVOT_DEFAULT_AXIS_LINE_COLOR
    }
  }
}

export default gauge
