import ChartTypes from './ChartTypes'
import {
  PIVOT_DEFAULT_AXIS_LINE_COLOR,
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_DEFAULT_FONT_COLOR,
  CHART_LABEL_POSITIONS
} from 'app/globalConstants'

import { IChartInfo } from 'containers/Widget/components/Widget'

const doubleYAxis: IChartInfo = {
  id: ChartTypes.DoubleYAxis,
  name: 'doubleYAxis',
  title: '双Y轴图',
  icon: 'icon-duplex',
  coordinate: 'cartesian',
  rules: [{ dimension: 1, metric: [2, 9999] }],
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
      title: '左轴指标',
      type: 'value'
    },
    secondaryMetrics: {
      title: '右轴指标',
      type: 'value'
    },
    filters: {
      title: '筛选',
      type: 'all'
    }
    // color: {
    //   title: '颜色',
    //   type: 'category'
    // },
    // tip: {
    //   title: '提示信息',
    //   type: 'value'
    // }
  },
  style: {
    spec: {
      stack: false,
      smooth: false,
      step: false,
      symbol: true,
      label: false
    },
    doubleYAxis: {
      yAxisLeft: 'line',
      yAxisRight: 'bar',
      yAxisSplitNumber: 5,
      dataZoomThreshold: 0,
      showLine: true,
      lineStyle: 'solid',
      lineSize: '1',
      lineColor: PIVOT_DEFAULT_AXIS_LINE_COLOR,
      showLabel: true,
      labelFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      labelFontSize: '12',
      labelColor: PIVOT_DEFAULT_FONT_COLOR
    },
    xAxis: {
      showLine: true,
      lineStyle: 'solid',
      lineSize: '1',
      lineColor: PIVOT_DEFAULT_AXIS_LINE_COLOR,
      showLabel: true,
      labelFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      labelFontSize: '12',
      labelColor: PIVOT_DEFAULT_FONT_COLOR,
      xAxisInterval: 0,
      xAxisRotate: 0
    },
    splitLine: {
      showHorizontalLine: true,
      horizontalLineStyle: 'dashed',
      horizontalLineSize: '1',
      horizontalLineColor: PIVOT_DEFAULT_AXIS_LINE_COLOR,
      showVerticalLine: false,
      verticalLineStyle: 'dashed',
      verticalLineSize: '1',
      verticalLineColor: PIVOT_DEFAULT_AXIS_LINE_COLOR
    },
    legend: {
      showLegend: true,
      legendPosition: 'right',
      selectAll: true,
      fontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      fontSize: '12',
      color: PIVOT_DEFAULT_FONT_COLOR
    }
  }
}

export default doubleYAxis
