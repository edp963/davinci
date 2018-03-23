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

import line from '../charts/line'
import bar from '../charts/bar'
import scatter from '../charts/scatter'
import pie from '../charts/pie'
import area from '../charts/area'
import funnel from '../charts/funnel'
import sankey from '../charts/sankey'
import treemap from '../charts/treemap'
import wordCloud from '../charts/wordCloud'
import map from '../charts/map'
import doubleYAxis from '../charts/doubleYAxis'
import boxplot from '../charts/boxplot'
import graph from '../charts/graph'
import markBoxplot from '../charts/markBoxplot'
import waterfall from '../charts/waterfall'
import gauge from '../charts/gauge'

export const iconMapping = {
  line: 'icon-chart-line',
  bar: 'icon-chart-bar',
  scatter: 'icon-scatter-chart',
  pie: 'icon-chartpie',
  area: 'icon-area-chart',
  sankey: 'icon-kongjiansangjitu',
  funnel: 'icon-iconloudoutu',
  treemap: 'icon-chart-treemap',
  wordCloud: 'icon-chartwordcloud',
  table: 'icon-table',
  text: 'icon-text',
  map: 'icon-china',
  doubleYAxis: 'icon-duplex',
  boxplot: 'icon-508tongji_xiangxiantu',
  markBoxplot: 'icon-508tongji_xiangxiantu',
  graph: 'icon-510tongji_guanxitu',
  waterfall: 'icon-waterfall',
  gauge: 'icon-gauge'
}

export function echartsOptionsGenerator ({ dataSource, chartInfo, chartParams, interactIndex }) {
  // chartInfo 去层级
  const flatInfo = Object.assign({}, {
    title: chartInfo.title,
    name: chartInfo.name
  }, chartInfo.params.reduce((fi, info) => {
    info.items.forEach(i => {
      fi[i.name] = i
    })
    return fi
  }, {}))

  switch (flatInfo.name) {
    case 'line':
      return line(dataSource, flatInfo, chartParams, interactIndex)
    case 'bar':
      return bar(dataSource, flatInfo, chartParams, interactIndex)
    case 'scatter':
      return scatter(dataSource, flatInfo, chartParams, interactIndex)
    case 'pie':
      return pie(dataSource, flatInfo, chartParams, interactIndex)
    case 'area':
      return area(dataSource, flatInfo, chartParams, interactIndex)
    case 'sankey':
      return sankey(dataSource, flatInfo, chartParams, interactIndex)
    case 'funnel':
      return funnel(dataSource, flatInfo, chartParams, interactIndex)
    case 'treemap':
      return treemap(dataSource, flatInfo, chartParams, interactIndex)
    case 'wordCloud':
      return wordCloud(dataSource, flatInfo, chartParams, interactIndex)
    case 'map':
      return map(dataSource, flatInfo, chartParams, interactIndex)
    case 'doubleYAxis':
      return doubleYAxis(dataSource, flatInfo, chartParams, interactIndex)
    case 'boxplot':
      return boxplot(dataSource, flatInfo, chartParams, interactIndex)
    case 'graph':
      return graph(dataSource, flatInfo, chartParams, interactIndex)
    case 'markBoxplot':
      return markBoxplot(dataSource, flatInfo, chartParams, interactIndex)
    case 'waterfall':
      return waterfall(dataSource, flatInfo, chartParams, interactIndex)
    case 'gauge':
      return gauge(dataSource, flatInfo, chartParams, interactIndex)
    default:
      return {}
  }
}
