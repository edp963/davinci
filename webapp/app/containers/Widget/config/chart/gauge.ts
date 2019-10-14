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
} from '../../../../globalConstants'

import { IChartInfo } from '../../../../containers/Widget/components/Widget'
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
