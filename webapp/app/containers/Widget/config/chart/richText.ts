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

import { IChartInfo } from 'containers/Widget/components/Widget'
import { getDefaultContent } from 'components/RichText'

const richText: IChartInfo = {
  id: ChartTypes.RichText,
  name: 'richText',
  title: '富文本',
  icon: 'icon-text',
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
    richText: {
      content: getDefaultContent()
    },
    spec: {}
  }
}

export default richText
