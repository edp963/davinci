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
import radar from '../charts/radar'
import parallel from '../charts/parallel'
import confidenceBand from '../charts/confidenceBand'

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
  scorecard: 'icon-calendar1',
  text: 'icon-text',
  map: 'icon-china',
  doubleYAxis: 'icon-duplex',
  boxplot: 'icon-508tongji_xiangxiantu',
  markBoxplot: 'icon-508tongji_xiangxiantu',
  graph: 'icon-510tongji_guanxitu',
  waterfall: 'icon-waterfall',
  gauge: 'icon-gauge',
  radar: 'icon-radarchart',
  parallel: 'icon-parallel',
  confidenceBand: 'icon-confidence-band'
}

export function echartsOptionsGenerator ({ dataSource, chartInfo, chartParams, interactIndex }: { dataSource: any, chartInfo: any, chartParams: any, interactIndex?: number }) {
  // chartInfo 去层级
  const flatInfo = {
    title: chartInfo.title,
    name: chartInfo.name,
    ...chartInfo.params.reduce((fi, info) => {
      info.items.forEach((i) => {
        fi[i.name] = i
      })
      return fi
    }, {})
  }

  let result

  switch (flatInfo.name) {
    // case 'line':
    //   result = line(dataSource, flatInfo, chartParams, interactIndex)
    //   break
    // case 'bar':
    //   result = bar(dataSource, flatInfo, chartParams, interactIndex)
    //   break
    // case 'scatter':
    //   result = scatter(dataSource, flatInfo, chartParams)
    //   break
    // case 'pie':
    //   result = pie(dataSource, flatInfo, chartParams, interactIndex)
    //   break
    case 'area':
      result = area(dataSource, flatInfo, chartParams)
      break
    case 'sankey':
      result = sankey(dataSource, flatInfo, chartParams)
      break
    case 'funnel':
      result = funnel(dataSource, flatInfo, chartParams, interactIndex)
      break
    case 'treemap':
      result = treemap(dataSource, flatInfo, chartParams)
      break
    case 'wordCloud':
      result = wordCloud(dataSource, flatInfo, chartParams)
      break
    case 'map':
      result = map(dataSource, flatInfo, chartParams, interactIndex)
      break
    case 'doubleYAxis':
      result = doubleYAxis(dataSource, flatInfo, chartParams, interactIndex)
      break
    case 'boxplot':
      result = boxplot(dataSource, flatInfo, chartParams, interactIndex)
      break
    case 'graph':
      result = graph(dataSource, flatInfo, chartParams, interactIndex)
      break
    case 'markBoxplot':
      result = markBoxplot(dataSource, flatInfo, chartParams, interactIndex)
      break
    case 'waterfall':
      result = waterfall(dataSource, flatInfo, chartParams, interactIndex)
      break
    case 'gauge':
      result = gauge(dataSource, flatInfo, chartParams)
      break
    case 'radar':
      result = radar(dataSource, flatInfo, chartParams, interactIndex)
      break
    case 'parallel':
      result = parallel(dataSource, flatInfo, chartParams, interactIndex)
      break
    case 'confidenceBand':
      result = confidenceBand(dataSource, flatInfo, chartParams, interactIndex)
      break
    default:
      result = {}
      break
  }

  return Promise.resolve(result)
}
