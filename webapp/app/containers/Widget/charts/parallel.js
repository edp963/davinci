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

export default function (dataSource, flatInfo, chartParams, interactIndex) {
  const hasGroups = flatInfo.groups

  const {
    categories,
    metrics,
    groups,
    hasLegend,
    legendSelected,
    legendPosition,
    top,
    bottom,
    left,
    right,
    toolbox
  } = chartParams

  let grouped,
    parallelAxisOptions,
    metricOptions,
    legendOptions,
    parallelOptions,
    toolboxOptions

  grouped = {}
  if (hasGroups && groups && groups.length) {
    grouped = makeGrouped(dataSource, groups, metrics, categories)
  }

  if (metrics && metrics.length) {
    parallelAxisOptions = {
      parallelAxis: metrics.map((m, idx) => ({
        dim: idx,
        name: m
      }))
    }
  }

  let dim = parallelAxisOptions.parallelAxis.length
  if (categories && categories.length) {
    categories.forEach(c => {
      let data = dataSource.map(item => item[c])
      data = data.filter((item, idx) => (
        data.indexOf(item) === idx
      ))
      parallelAxisOptions.parallelAxis.push({
        dim: dim++,
        name: c,
        type: 'category',
        data: data.sort()
      })
    })
  }

  let metricArr
  if (hasGroups && groups && groups.length) {
    metricArr = Object.keys(grouped).map(key => ({
      name: key,
      type: 'parallel',
      lineStyle: {
        width: 4
      },
      data: grouped[key]
    }))
  } else {
    metricArr = [{
      type: 'parallel',
      lineStyle: {
        width: 4
      },
      data: dataSource.map(item => [].concat(metrics, categories).map(m => item[m]))
    }]
  }
  metricOptions = {
    series: metricArr
  }

  // legend
  if (hasLegend && hasLegend.length) {
    let orient
    let positions

    switch (legendPosition) {
      case 'right':
        orient = { orient: 'vertical' }
        positions = { right: 8, top: 40, bottom: 16 }
        break
      case 'bottom':
        orient = { orient: 'horizontal' }
        positions = { bottom: 16, left: 8, right: 8 }
        break
      default:
        orient = { orient: 'horizontal' }
        positions = { top: 3, left: 8, right: 120 }
        break
    }

    const selected = legendSelected === 'unselectAll'
      ? {
        selected: metricArr.reduce((obj, m) => Object.assign(obj, { [m.name]: false }), {})
      } : null

    legendOptions = {
      legend: Object.assign({
        data: metricArr.map(m => m.name),
        type: 'scroll'
      }, orient, positions, selected)
    }
  }

  // parallel
  parallelOptions = {
    parallel: {
      top: `${top}%`,
      left: `${left}%`,
      right: `${right}%`,
      bottom: `${bottom}%`,
      axisExpandable: true,
      axisExpandCenter: 15,
      axisExpandCount: 10,
      axisExpandWidth: 60,
      axisExpandTriggerOn: 'mousemove'
    }
  }

  // toolbox
  toolboxOptions = toolbox && toolbox.length
    ? {
      toolbox: {
        feature: {
          dataView: {readOnly: false},
          restore: {},
          saveAsImage: {}
        },
        right: 8
      }
    } : null

  return Object.assign({},
    parallelAxisOptions,
    metricOptions,
    legendOptions,
    parallelOptions,
    toolboxOptions)
}

/**
 *
 *
 * @export
 * @param {Array<Array<String|Number>>} dataSource
 * @param {Array<String>} groupColumns
 * @param {Array<String>} metrics
 * @param {Array<String>} categories
 * @returns grouped data
 */
export function makeGrouped (dataSource, groupColumns, metrics, categories) {
  let grouped = {}

  if (metrics) {
    // init the key of 'grouped' according by distincted values from 'dataSource'
    dataSource.forEach(item => {
      let key = groupColumns.map(grpCol => item[grpCol]).join(' ')
      if (!grouped[key]) {
        grouped[key] = []
      }
      let row = [];
      [metrics, categories].forEach(fields => {
        if (fields && fields.length) {
          row.push(...fields.map(f => item[f]))
        }
      })
      grouped[key].push(row)
    })
  }

  return grouped
}
