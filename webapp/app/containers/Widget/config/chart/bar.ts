import ChartTypes from './ChartTypes'
import {
  PIVOT_DEFAULT_AXIS_LINE_COLOR,
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_DEFAULT_FONT_COLOR,
  CHART_LABEL_POSITIONS
} from 'app/globalConstants'

import { IChartInfo } from 'containers/Widget/components/Widget'
import { EmptyStack } from 'app/containers/Widget/components/Config/Stack/constants'

const bar: IChartInfo = {
  id: ChartTypes.Bar,
  name: 'bar',
  title: '柱状图',
  icon: 'icon-chart-bar',
  coordinate: 'cartesian',
  rules: [{ dimension: [0, 1], metric: [1, 9999] }],
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
    },
    color: {
      title: '颜色',
      type: 'category'
    },
    tip: {
      title: '提示信息',
      type: 'value'
    }
  },
  style: {
    spec: {
      stack: false,
      barChart: false,
      percentage: false
    },
    bar: {
      barChart: false,
      border: {
        color: '#000',
        width: 0,
        type: 'solid',
        radius: 0
      },
      gap: 30,
      width: null,
      stack: EmptyStack
    },
    label: {
      showLabel: false,
      labelPosition: CHART_LABEL_POSITIONS[0].value,
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
    yAxis: {
      showLine: true,
      lineStyle: 'solid',
      lineSize: '1',
      lineColor: PIVOT_DEFAULT_AXIS_LINE_COLOR,
      showLabel: true,
      labelFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      labelFontSize: '12',
      labelColor: PIVOT_DEFAULT_FONT_COLOR,
      showTitleAndUnit: true,
      titleFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      titleFontSize: '12',
      titleColor: PIVOT_DEFAULT_FONT_COLOR,
      nameLocation: 'middle',
      nameRotate: 90,
      nameGap: 40,
      min: null,
      max: null
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

export default bar
