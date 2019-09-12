import ChartTypes from './ChartTypes'
import {
  PIVOT_BORDER,
  PIVOT_CHART_ELEMENT_MIN_WIDTH,
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_DEFAULT_AXIS_LINE_COLOR,
  PIVOT_DEFAULT_FONT_COLOR,
  CHART_PIE_LABEL_POSITIONS,
  DEFAULT_FONT_STYLE
} from 'app/globalConstants'

import {
  IChartInfo
} from 'containers/Widget/components/Widget'

const parallel: IChartInfo = {
  id: ChartTypes.Parallel,
  name: 'parallel',
  title: '平行坐标图',
  icon: 'icon-parallel',
  coordinate: 'cartesian',
  rules: [{ dimension: [1, 9999], metric: [1, 9999] }],
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
    }
    // tip: {
    //   title: '提示信息',
    //   type: 'value'
    // }
  },
  style: {
    axis: {
      inverse: false,
      showLine: true,
      lineStyle: 'solid',
      lineSize: '1',
      lineColor: PIVOT_DEFAULT_AXIS_LINE_COLOR,
      showLabel: true,
      labelFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      labelFontSize: '12',
      labelColor: PIVOT_DEFAULT_FONT_COLOR,
      showTitleAndUnit: true,
      nameLocation: 'start',
      nameRotate: 0,
      nameGap: 20,
      titleFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      titleFontStyle: DEFAULT_FONT_STYLE,
      titleFontSize: '12',
      titleColor: PIVOT_DEFAULT_FONT_COLOR
    },
    legend: {
      showLegend: true,
      legendPosition: 'right',
      selectAll: true,
      fontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      fontSize: '12',
      color: PIVOT_DEFAULT_FONT_COLOR
    },
    areaSelect: {
      width: PIVOT_CHART_ELEMENT_MIN_WIDTH,
      borderWidth: PIVOT_BORDER,
      borderColor: '#a0c5e8',
      color: '#a0c5e8',
      opacity: 0.3
    },
    spec: {
      layout: 'horizontal',
      smooth: false
    }
  }
}

export default parallel
