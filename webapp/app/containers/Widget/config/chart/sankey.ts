import ChartTypes from './ChartTypes'
import {
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_DEFAULT_FONT_COLOR,
  CHART_PIE_LABEL_POSITIONS
} from 'app/globalConstants'

import { IChartInfo } from 'containers/Widget/components/Widget'
const sankey: IChartInfo = {
  id: ChartTypes.Sankey,
  name: 'sankey',
  title: '桑基图',
  icon: 'icon-kongjiansangjitu',
  coordinate: 'cartesian',
  rules: [{ dimension: [2, 9999], metric: 1 }],
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
    label: {
      showLabel: true,
      labelPosition: 'right',
      labelFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      labelFontSize: '12',
      labelColor: PIVOT_DEFAULT_FONT_COLOR
    },
    spec: {
      nodeWidth: 20,
      nodeGap: 8,
      orient: 'horizontal',
      draggable: true
    }
  }
}

export default sankey
