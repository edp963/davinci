import ChartTypes from './ChartTypes'
import {
  PIVOT_DEFAULT_AXIS_LINE_COLOR,
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_DEFAULT_FONT_COLOR,
  PIVOT_DEFAULT_HEADER_BACKGROUND_COLOR
} from 'app/globalConstants'

import { IChartInfo } from 'containers/Widget/components/Widget'

const table: IChartInfo = {
  id: ChartTypes.Table,
  name: 'table',
  title: '表格',
  icon: 'icon-table',
  coordinate: 'other',
  rules: [{ dimension: [0, 9999], metric: [0, 9999] }],
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
    table: {
      fontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      fontSize: '12',
      color: PIVOT_DEFAULT_FONT_COLOR,
      lineStyle: 'solid',
      lineColor: PIVOT_DEFAULT_AXIS_LINE_COLOR,
      headerBackgroundColor: PIVOT_DEFAULT_HEADER_BACKGROUND_COLOR,

      headerConfig: [],
      columnsConfig: [],
      leftFixedColumns: [],
      rightFixedColumns: [],
      headerFixed: true,
      autoMergeCell: true,
      bordered: true,
      size: 'default',
      withPaging: true,
      pageSize: '20',
      withNoAggregators: false
    },
    spec: {

    }
  }
}

export default table
