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

/*
 * Pie chart options generator
 */

export default function (dataSource, flatInfo, chartParams, interactIndex) {
  const {
    metrics,
    target,
    source,
    tooltip,
    legend,
    toolbox,
    top,
    bottom,
    left,
    right
  } = chartParams
  let {
    category
  } = chartParams

  if (!(category && category.length)) {
    category = source
  }

  let metricOptions,
    labelOptions,
    tooltipOptions,
    legendOptions,
    toolboxOptions,
    gridOptions,
    otherOptions

  // series 数据项
  let metricArr = []

  // 节点列
  let nodes = []
  // 关系列
  let links = []

  let categories = []
  // node value
  let nodeValue = []

  let step1 = dataSource.map(data => data[category])
  categories = step1.filter((st, index) => step1.indexOf(st) === index).concat(['其他'])
  nodeValue = categories.map(cate => {
    let ca = dataSource.filter(data => data[category] === cate)
    return {
      key: cate,
      value: ca
    }
  })

  if (target && target.length && source && source.length && metrics && metrics.length) {
    links = dataSource.map(data => {
      Array.prototype.push.apply(nodes, [data[source], data[target]])
      return {
        value: data[metrics],
        source: data[source],
        target: data[target]
      }
    })
    if (nodeValue && nodeValue.length) {
      nodeValue = nodeValue.map(node => (
        {
          [node.key]: node.value.reduce((sum, value) => sum + Number(value[metrics]), 0)
        }
      ))
    }
  }

  if (nodes && nodes.length) {
    nodes = nodes.filter((node, index) => nodes.indexOf(node) === index).map(c => ({name: c, category: c}))
  }

  let nodeValueObj = nodeValue.reduce((sum, value) => Object.assign({}, sum, value), {})
  let nodeObjKey = Object.keys(nodeValueObj)
  let nodeObjValue = Object.values(nodeValueObj)
  let nodeObjValueComputed = computSymbolSize(Object.values(nodeValueObj))

  if (categories && categories.length && nodes && nodes.length) {
    nodes = nodes.map((node, index) => {
      let symbolSize
      let realValue
      let i
      if (categories.find(cate => cate === node['category'])) {
        i = nodeObjKey.indexOf(node['category'])
        symbolSize = nodeObjValueComputed[i]
        realValue = nodeObjValue[i]
        return {
          ...node,
          ...{
            symbolSize,
            realValue
          }
        }
      } else {
        return {
          ...node,
          ...{
            category: '其他',
            symbolSize: 1,
            realValue: 0
          }
        }
      }
    })
  }
  labelOptions = {
    label: {
      normal: {
        show: true,
        position: 'right'
      }
    }
  }
  gridOptions = {
    grid: {
      top: top,
      left: left,
      right: right,
      bottom: bottom
    }
  }
  otherOptions = {
    animationDurationUpdate: 1000,
    animationEasingUpdate: 'quinticInOut'
  }

  let serieObj = Object.assign({},
    {
      type: 'graph',
      layout: 'circular',
      symbolSize: 30,
      roam: true,
      focusNodeAdjacency: true,
      edgeSymbol: ['circle', 'arrow'],
      edgeSymbolSize: [4, 10],
      edgeLabel: {
        normal: {}
      },
      circular: {
        rotateLabel: true
      },
      data: nodes,
      links: links,
      categories: categories.map(d => ({name: d})),
      lineStyle: {
        normal: {
          color: 'source',
          opacity: 0.9,
          curveness: 0.3
        }
      }
    },
    labelOptions
  )
  metricArr.push(serieObj)
  metricOptions = {
    series: metricArr
  }

  // tooltip
  tooltipOptions = tooltip && tooltip.length
    ? {
      tooltip: {
        formatter: function (param) {
          let data = param.data
          let dataType = param.dataType
          switch (dataType) {
            case 'edge':
              return `${data.source} => ${data.target} : ${data.value}`
            case 'node':
              return `${data.name} : ${data.realValue}`
            default:
              return ''
          }
        }
      }
    } : null

  // legend
  legendOptions = legend && legend.length
    ? {
      legend: {
        data: categories,
        orient: 'vertical',
        left: 'left',
        type: 'scroll'
      }
    } : null

  // toolbox
  toolboxOptions = toolbox && toolbox.length
    ? {
      toolbox: {
        feature: {
          dataView: {readOnly: false},
          restore: {},
          saveAsImage: {}
        }
      }
    } : null

  return Object.assign({},
    metricOptions,
    tooltipOptions,
    legendOptions,
    toolboxOptions,
    gridOptions,
    otherOptions
  )
}

function computSymbolSize (list) {
  if (!(list && Array.isArray(list) && list.length)) return false
  let max = list.reduce((sum, value) => value > sum ? value : sum, 0)
  let min = 1
  return list.map(li => {
    let count = Number(li) * 60 / max
    return count < min ? min : count
  })
}
