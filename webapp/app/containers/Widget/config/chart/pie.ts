import {
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_DEFAULT_FONT_COLOR,
  CHART_PIE_LABEL_POSITIONS
} from '../../../../globalConstants'

import { IChartInfo } from '../../../../containers/Widget/components/Widget'
const pie: IChartInfo = {
  id: 5,
  name: 'pie',
  title: '饼图',
  icon: 'icon-chartpie',
  coordinate: 'cartesian',
  requireDimetions: [0, 9999],
  requireMetrics: 1,
  dimetionAxis: 'col',
  data: {
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
    label: {
      showLabel: false,
      pieLabelPosition: CHART_PIE_LABEL_POSITIONS[0].value,
      labelFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      labelFontSize: '12',
      labelColor: PIVOT_DEFAULT_FONT_COLOR
    },
    legend: {
      showLegend: true,
      legendPosition: 'right',
      selectAll: true,
      fontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      fontSize: '12',
      color: PIVOT_DEFAULT_FONT_COLOR
    },
    spec: {
      roseType: false,
      circle: false
    }
    // toolbox: {
    //   showToolbox: false
    // }
  }
}

export default pie
