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

// import area from './area.json'
// import bar from './bar.json'
// import funnel from './funnel.json'
// import line from './line.json'
// import pie from './pie.json'
// import sankey from './sankey.json'
// import scatter from './scatter.json'
// import wordCloud from './wordCloud.json'
// import table from './table.json'
// import scorecard from './scorecard.json'
// import text from './text.json'
// import map from './map.json'
// import doubleYAxis from './doubleYAxis.json'
// import boxplot from './boxplot.json'
// import graph from './graph.json'
// import markBoxplot from './markBoxplot.json'
// import waterfall from './waterfall.json'
// import gauge from './gauge.json'
// import radar from './radar.json'
// import parallel from './parallel.json'
// import confidenceBand from './confidenceBand.json'

export default [{
  id: 1,
  name: '透视表',
  icon: 'icon-table',
  requireDimetions: [0, 9999, 9999],
  requireMetrics: [0, 9999]
}, {
  id: 2,
  name: '折线图',
  icon: 'icon-chart-line',
  requireDimetions: [1, 1, 9999],
  requireMetrics: [1, 9999],
  dimetionAxis: 'col'
}, {
  id: 3,
  name: '柱状图',
  icon: 'icon-chart-bar',
  requireDimetions: [0, 1, 9999],
  requireMetrics: [1, 9999],
  dimetionAxis: 'col'
}, {
  id: 4,
  name: '水平柱状图',
  icon: 'icon-hbar',
  requireDimetions: [0, 1, 9999],
  requireMetrics: [1, 9999],
  dimetionAxis: 'row'
}, {
  id: 5,
  name: '散点图',
  icon: 'icon-scatter-chart',
  requireDimetions: [0, 0, 9999],
  requireMetrics: 2
}]
