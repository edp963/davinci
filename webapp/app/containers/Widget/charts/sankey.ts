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

const message = require('antd/lib/message')

/*
 * Sankey chart options generator
 */
export default function (dataSource, flatInfo, chartParams) {
  const {
    source,
    target,
    metrics,
    tooltip,
    toolbox
  } = chartParams

  let metricOptions
  let tooltipOptions
  let toolboxOptions
  let gridOptions

  // series 数据项
  const metricArr = []

  // 节点列
  let nodes = []
  // 关系列
  let links = []

  if (source && target) {
    links = dataSource.map((data) => {
      nodes.push(...[data[source], data[target]])
      return {
        source: data[source],
        target: data[target],
        value: data[metrics]
      }
    })

    const graph = {}
    links.forEach((link) => {
      if (!graph[link.source]) {
        graph[link.source] = []
      }
      graph[link.source].push(link.target)
    })

    const cycle = getCycle(graph)
    if (cycle && cycle.length) {
      message.error(`节点 ${cycle.join()} 存在循环引用`)
      links = []
    }
  }
  nodes = nodes.filter((n, idx) => (
    nodes.indexOf(n) === idx
  )).map((n) => ({ name: n }))

  const serieObj = {
    name: '数据',
    type: 'sankey',
    layout: 'none',
    data: nodes,
    links,
    itemStyle: {
      normal: {
        borderWidth: 1,
        borderColor: '#aaa'
      }
    },
    lineStyle: {
      normal: {
        curveness: 0.5
      }
    }
  }
  metricArr.push(serieObj)
  metricOptions = {
    series: metricArr
  }

  // tooltip
  tooltipOptions = tooltip && tooltip.length
    ? {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      }
    } : null

  // toolbox
  toolboxOptions = toolbox && toolbox.length
    ? {
      toolbox: {
        feature: {
          saveAsImage: {
            pixelRatio: 2
          }
        }
      }
    } : null

  // grid
  gridOptions = {
    grid: {
      top: 40,
      left: 60,
      right: 60,
      bottom: 30
    }
  }

  return {
    ...metricOptions,
    ...tooltipOptions,
    ...toolboxOptions,
    ...gridOptions
  }
}

function getCycle (graph) {
  // Copy the graph, converting all node references to String
  graph = Object.assign({}, ...Object.keys(graph).map((node) => ({ [node]: graph[node].map(String) })))

  let queue = Object.keys(graph).map((node) => [node])
  while (queue.length) {
    const batch = []
    for (const path of queue) {
      const parents = graph[path[0]] || []
      for (const node of parents) {
        if (node === path[path.length - 1]) {
          return [node, ...path]
        }
        batch.push([node, ...path])
      }
    }
    queue = batch
  }
}
