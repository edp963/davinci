import {
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_DEFAULT_FONT_COLOR,
  CHART_LABEL_POSITIONS,
  CHART_VISUALMAP_POSITIONS
} from '../../../../globalConstants'
const defaultTheme = require('../../../../assets/json/echartsThemes/default.project.json')
const defaultThemeColors = defaultTheme.theme.color

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
  data: {},
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
      visualMapHeight: 150,
      startColor: defaultThemeColors[0],
      endColor: defaultThemeColors[2]
    },
    spec: {
      layerType: 'map',
      roam: false
    }
  }
}

export default map
