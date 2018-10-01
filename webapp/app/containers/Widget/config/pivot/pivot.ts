import {
  PIVOT_DEFAULT_AXIS_LINE_COLOR,
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_DEFAULT_FONT_COLOR,
  PIVOT_DEFAULT_HEADER_BACKGROUND_COLOR
} from '../../../../globalConstants'

import { IChartInfo } from '../../../../containers/Widget/components/Widget'

const pivot: IChartInfo = {
  id: 1,
  name: 'pivot',
  title: '透视表',
  icon: 'icon-table',
  coordinate: 'cartesian',
  requireDimetions: [0, 9999],
  requireMetrics: [0, 9999],
  data: {
    color: {
      title: '颜色',
      type: 'category'
    }
  },
  style: {
    pivot: {
      fontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      fontSize: '12',
      color: PIVOT_DEFAULT_FONT_COLOR,
      lineStyle: 'solid',
      lineColor: PIVOT_DEFAULT_AXIS_LINE_COLOR,
      headerBackgroundColor: PIVOT_DEFAULT_HEADER_BACKGROUND_COLOR
    }
  }
}

export default pivot
