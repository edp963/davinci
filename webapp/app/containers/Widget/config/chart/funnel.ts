import ChartTypes from './ChartTypes'
import {
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_DEFAULT_FONT_COLOR,
  CHART_FUNNEL_LABEL_POSITIONS,
  CHART_SORT_MODES,
  CHART_ALIGNMENT_MODES
} from 'app/globalConstants'

import { IChartInfo } from 'containers/Widget/components/Widget'
const funnel: IChartInfo = {
  id: ChartTypes.Funnel,
  name: 'funnel',
  title: '漏斗图',
  icon: 'icon-iconloudoutu',
  coordinate: 'cartesian',
  rules: [{ dimension: [0, 9999], metric: 1 }, { dimension: 0, metric: [2, 9999] }],
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
      showLabel: false,
      funnelLabelPosition: CHART_FUNNEL_LABEL_POSITIONS[0].value,
      labelFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      labelFontSize: '12',
      labelColor: PIVOT_DEFAULT_FONT_COLOR,
      labelParts: ['dimensionValue', 'indicatorValue', 'percentage']
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
      sortMode: CHART_SORT_MODES[0].value,
      alignmentMode: CHART_ALIGNMENT_MODES[0].value,
      gapNumber: 0
    }
  }
}

export default funnel
