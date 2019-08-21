import ChartTypes from './ChartTypes'
import {
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_DEFAULT_FONT_COLOR,
  CHART_PIE_LABEL_POSITIONS
} from 'app/globalConstants'

import { IChartInfo } from 'containers/Widget/components/Widget'
const radar: IChartInfo = {
  id: ChartTypes.Radar,
  name: 'radar',
  title: '雷达图',
  icon: 'icon-radarchart',
  coordinate: 'cartesian',
  rules: [{ dimension: 1, metric: [1, 9999] }, { dimension: 0, metric: [3, 9999] }],
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
    label: {
      showLabel: true,
      labelFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      labelFontSize: '12',
      labelColor: PIVOT_DEFAULT_FONT_COLOR,
      labelParts: ['indicatorName', 'indicatorValue']
    },
    legend: {
      showLegend: true,
      legendPosition: 'right',
      selectAll: true,
      fontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      fontSize: '12',
      color: PIVOT_DEFAULT_FONT_COLOR
    },
    radar: {
      shape: 'polygon', // 'polygon' | 'circle'
      name: {
        show: true,
        fontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
        fontSize: '12',
        color: PIVOT_DEFAULT_FONT_COLOR
      },
      nameGap: 15,
      splitNumber: 5
    },
    spec: {}
    // toolbox: {
    //   showToolbox: false
    // }
  }
}

export default radar
