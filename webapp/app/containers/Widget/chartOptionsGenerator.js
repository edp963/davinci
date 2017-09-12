/*-
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

import line from './charts/line'
import bar from './charts/bar'
import scatter from './charts/scatter'
import pie from './charts/pie'
import area from './charts/area'
import funnel from './charts/funnel'
import sankey from './charts/sankey'
import treemap from './charts/treemap'
import wordCloud from './charts/wordCloud'

export default function ({ dataSource, chartInfo, chartParams }) {
  // info 去层级
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
      return line(dataSource, flatInfo, chartParams)
    case 'bar':
      return bar(dataSource, flatInfo, chartParams)
    case 'scatter':
      return scatter(dataSource, flatInfo, chartParams)
    case 'pie':
      return pie(dataSource, flatInfo, chartParams)
    case 'area':
      return area(dataSource, flatInfo, chartParams)
    case 'sankey':
      return sankey(dataSource, flatInfo, chartParams)
    case 'funnel':
      return funnel(dataSource, flatInfo, chartParams)
    case 'treemap':
      return treemap(dataSource, flatInfo, chartParams)
    case 'wordCloud':
      return wordCloud(dataSource, flatInfo, chartParams)
    default:
      return {}
  }
}
