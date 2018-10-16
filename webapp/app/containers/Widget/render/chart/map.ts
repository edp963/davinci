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
 * map chart options generator
 */

// import geoData from '../../../assets/json/geo.json'
import { safeAddition } from '../../../../utils/util'
import { DEFAULT_ECHARTS_THEME } from '../../../../globalConstants'

let geoData

export default function (dataSource, flatInfo, chartParams, interactIndex) {
  return import('../../../../assets/json/geo.json').then((d) => {
    geoData = d

    const {
      area,
      group,
      value,
      layerType,
      // visualMapStyle,TODO
      roam,
      toolbox
    } = chartParams

    let metricOptions
    let scatterOptions
    // let heatmapOptions
    let visualMapOptions
    let tooltipOptions
    let toolboxOptions

    // 对原数据进行加工
    let dataTree

    if (area) {
      dataTree = dataSource.reduce((tree, ds) => {
        const areaVal = ds[area]
        const areaGeo = geoData[areaVal]

        if (areaGeo) {
          if (!tree[areaVal]) {
            tree[areaVal] = {
              lon: areaGeo.lon,
              lat: areaGeo.lat,
              value: 0,
              children: {}
            }
          }

          tree[areaVal].value = safeAddition(tree[areaVal].value, Number(ds[value]))

          if (group) {
            if (!tree[areaVal].children[ds[group]]) {
              tree[areaVal].children[ds[group]] = 0
            }
            tree[areaVal].children[ds[group]] = safeAddition(tree[areaVal].children[ds[group]], Number(ds[value]))
          }
        }

        return tree
      }, {})
    } else {
      dataTree = {}
    }

    // series 数据项
    const metricArr = []

    scatterOptions = {
      symbolSize: 12,
      label: {
        normal: {
          show: false
        },
        emphasis: {
          show: false
        }
      },
      itemStyle: {
        normal: {
          opacity: interactIndex === undefined ? 1 : 0.25
        }
        // emphasis: {
        //   borderColor: DEFAULT_PRIMARY_COLOR,
        //   borderWidth: 1
        // }
      }
    }

    let serieObj = {
      name: area,
      type: layerType || 'scatter',
      coordinateSystem: 'geo',
      data: Object.keys(dataTree).map((key, index) => {
        const { lon, lat, value } = dataTree[key]
        if (index === interactIndex) {
          return {
            name: key,
            value: [lon, lat, value],
            itemStyle: {
              normal: {
                opacity: 1
              }
            }
          }
        } else {
          return {
            name: key,
            value: [lon, lat, value]
          }
        }
      })
    }
    if (layerType === 'scatter') {
      serieObj = {
        ...serieObj,
        ...scatterOptions
      }
    }

    metricArr.push(serieObj)
    metricOptions = {
      series: metricArr
    }

    // visualMap
    visualMapOptions = value && {
      visualMap: {
        min: 0,
        max: Math.max(...dataSource.map((d) => d[value] || 0)),
        calculable: true,
        inRange: {
          color: DEFAULT_ECHARTS_THEME.visualMapColor
        },
        left: 10,
        bottom: 20
      }
    }

    // tooltip
    tooltipOptions = {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const treeNode = dataTree[params.name]

          let content = `${params.name}：${treeNode.value}`

          if (group && group.length) {
            const groupContent = Object.keys(treeNode.children).map((k) => `${k}：${treeNode.children[k]}<br/>`).join('')
            content += `<br/>${groupContent}`
          }

          return content
        }
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
          }
        }
      } : null

    return {
      geo: {
        map: 'china',
        label: {
          emphasis: {
            show: false
          }
        },
        itemStyle: {
          normal: {
            areaColor: '#0000003F',
            borderColor: '#FFFFFF',
            borderWidth: 1
          },
          emphasis: {
            areaColor: `#00000059`
          }
        },
        roam: !!(roam && roam.length)
      },
      ...metricOptions,
      ...visualMapOptions,
      ...tooltipOptions,
      ...toolboxOptions
    }
  })
}
