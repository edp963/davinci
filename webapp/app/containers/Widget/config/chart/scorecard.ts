/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import ChartTypes from './ChartTypes'
import {
  PIVOT_DEFAULT_AXIS_LINE_COLOR,
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_DEFAULT_FONT_COLOR,
  CHART_LABEL_POSITIONS
} from 'app/globalConstants'

import { IChartInfo } from 'containers/Widget/components/Widget'

const scorecard: IChartInfo = {
  id: ChartTypes.Scorecard,
  name: 'scorecard',
  title: '翻牌器',
  icon: 'icon-calendar1',
  coordinate: 'other',
  rules: [{ dimension: 0, metric: [1, 3] }],
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
    scorecard: {
      headerVisible: true,
      headerColor: PIVOT_DEFAULT_FONT_COLOR,
      headerFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      prefixHeader: '',
      suffixHeader: '',
      prefixHeaderColor: PIVOT_DEFAULT_FONT_COLOR,
      prefixHeaderFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      suffixHeaderColor: PIVOT_DEFAULT_FONT_COLOR,
      suffixHeaderFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,

      contentVisible: true,
      contentColor: PIVOT_DEFAULT_FONT_COLOR,
      contentFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      prefixContent: '',
      suffixContent: '',
      prefixContentColor: PIVOT_DEFAULT_FONT_COLOR,
      prefixContentFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      suffixContentColor: PIVOT_DEFAULT_FONT_COLOR,
      suffixContentFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,

      footerVisible: true,
      footerColor: PIVOT_DEFAULT_FONT_COLOR,
      fontFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      prefixFooter: '',
      suffixFooter: '',
      prefixFooterColor: PIVOT_DEFAULT_FONT_COLOR,
      prefixFooterFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,
      suffixFooterColor: PIVOT_DEFAULT_FONT_COLOR,
      suffixFooterFontFamily: PIVOT_CHART_FONT_FAMILIES[0].value,

      fontSizeFixed: false,
      fontSizeMain: '48',
      fontSizeSub: '18'
    },
    spec: {

    }
  }
}

export default scorecard
