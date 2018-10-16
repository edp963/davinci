import {
  PIVOT_DEFAULT_AXIS_LINE_COLOR,
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_DEFAULT_FONT_COLOR,
  PIVOT_DEFAULT_HEADER_BACKGROUND_COLOR
} from '../../../../globalConstants'

import { IChartInfo } from '../../../../containers/Widget/components/Widget'

const table: IChartInfo = {
  id: 1,
  name: 'table',
  title: '表格',
  icon: 'icon-table',
  coordinate: 'other',
  requireDimetions: [0, 9999],
  requireMetrics: [0, 9999],
  data: {},
  style: {
    table: {
      fontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      fontSize: '12',
      color: PIVOT_DEFAULT_FONT_COLOR,
      lineStyle: 'solid',
      lineColor: PIVOT_DEFAULT_AXIS_LINE_COLOR,
      headerBackgroundColor: PIVOT_DEFAULT_HEADER_BACKGROUND_COLOR
    }
  }
}

export default table
