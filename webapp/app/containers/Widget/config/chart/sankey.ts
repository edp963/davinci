import {
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_DEFAULT_FONT_COLOR,
  CHART_PIE_LABEL_POSITIONS
} from '../../../../globalConstants'

import { IChartInfo } from '../../../../containers/Widget/components/Widget'
const sankey: IChartInfo = {
  id: 9,
  name: 'sankey',
  title: '桑基图',
  icon: 'icon-kongjiansangjitu',
  coordinate: 'cartesian',
  requireDimetions: [2, 9999],
  requireMetrics: 1,
  dimetionAxis: 'col',
  data: {},
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
