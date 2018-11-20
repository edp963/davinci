import ChartTypes from './ChartTypes'
import { IChartInfo } from '../../../../containers/Widget/components/Widget'
const wordCloud: IChartInfo = {
  id: ChartTypes.WordCloud,
  name: 'wordCloud',
  title: '词云',
  icon: 'icon-chartwordcloud',
  coordinate: 'other',
  requireDimetions: 1,
  requireMetrics: 1,
  dimetionAxis: 'col',
  data: {},
  style: {
    spec: {

    }
  }
}

export default wordCloud
