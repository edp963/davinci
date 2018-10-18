import {
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_DEFAULT_FONT_COLOR,
  CHART_LABEL_POSITIONS,
  CHART_VISUALMAP_POSITIONS
} from '../../../../globalConstants'

import { IChartInfo } from '../../../../containers/Widget/components/Widget'
const map: IChartInfo = {
  id: 7,
  name: 'map',
  title: '地图',
  icon: 'icon-china',
  coordinate: 'cartesian',
  requireDimetions: [0, 9999],
  requireMetrics: 1,
  dimetionAxis: 'col',
  data: {
    // color: {
    //   title: '颜色',
    //   type: 'category'
    // }
    // tip: {
    //   title: '提示信息',
    //   type: 'value'
    // }
  },
  style: {
    label: {
      showLabel: false,
      labelPosition: CHART_LABEL_POSITIONS[0].value,
      labelFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      labelFontSize: '12',
      labelColor: PIVOT_DEFAULT_FONT_COLOR
    },
    visualMap: {
      showVisualMap: true,
      visualMapPosition: CHART_VISUALMAP_POSITIONS[0].value,
      fontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      fontSize: '12',
      visualMapDirection: 'vertical',
      visualMapWidth: 20,
      visualMapHeight: 50,
      startColor: PIVOT_DEFAULT_FONT_COLOR,
      endColor: PIVOT_DEFAULT_FONT_COLOR
    },
    spec: {
      layerType: 'scatter',
      roam: false
    }
  }
}

export default map
