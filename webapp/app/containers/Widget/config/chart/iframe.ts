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

const iframe: IChartInfo = {
  id: ChartTypes.Iframe,
  name: 'iframe',
  title: '内嵌网页',
  icon: 'icon-iframe',
  coordinate: 'other',
  rules: [{ dimension: 0, metric: 0 }],
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
    iframe: {
      src: ''
    },
    spec: {

    }
  }
}

export default iframe
