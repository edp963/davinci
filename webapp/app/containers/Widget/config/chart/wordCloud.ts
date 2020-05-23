import ChartTypes from './ChartTypes'
import { IChartInfo } from 'containers/Widget/components/Widget'
const wordCloud: IChartInfo = {
  id: ChartTypes.WordCloud,
  name: 'wordCloud',
  title: '词云',
  icon: 'icon-chartwordcloud',
  coordinate: 'other',
  rules: [{ dimension: 1, metric: 1 }],
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
    spec: {

    }
  }
}

export default wordCloud
