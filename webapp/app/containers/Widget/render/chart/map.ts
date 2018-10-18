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

import { IChartProps } from '../../components/Chart'
import {
  decodeMetricName,
  getChartTooltipLabel,
  getTextWidth
} from '../../components/util'
import {
  getLegendOption,
  getLabelOption,
  getGridPositions
} from './util'
import {
  safeAddition
} from '../../../../utils/util'

import {
  DEFAULT_ECHARTS_THEME
} from '../../../../globalConstants'
import {
  geoData
} from '../../../../assets/json/geo.js'

const cityData = require('../../../../assets/json/city.json')
const provinceData = require('../../../../assets/json/province.json')

export default function (chartProps: IChartProps) {
  const {
    chartStyles,
    data,
    cols,
    metrics,
    model
  } = chartProps

  const {
    label,
    spec
  } = chartStyles

  const {
    labelColor,
    labelFontFamily,
    labelFontSize,
    labelPosition,
    showLabel
  } = label

  const {
    layerType,
    roam
  } = spec

  const labelOption = {
    label: {
      normal: {
        // formatter: '{b}',
        position: labelPosition,
        show: showLabel,
        color: labelColor,
        fontFamily: labelFontFamily,
        fontSize: labelFontSize
      }
    }
  }

  let metricOptions
  let scatterOptions
  const heatmapOptions = []
  let visualMapOptions

  let dataTree
  let visualMapMax
  metrics.forEach((m) => {
    const decodedMetricName = decodeMetricName(m.name)
    if (cols.length) {
      dataTree = data.reduce((tree, ds) => {
        let areaGeo
        let areaVal
        const group = []
        cols.forEach((cs) => {
          const { visualType } = model[cs]
          // todo
          if (visualType === 'geoProvince') {
            areaVal = ds[cs]
            for (const cd in provinceData) {
              if (areaVal && areaVal.includes(cd)) {
                areaGeo = provinceData[cd]
              }
            }
          } else if (visualType === 'geoCity') {
            areaVal = ds[cs]
            for (const cd in cityData) {
              if (areaVal && areaVal.includes(cd)) {
                areaGeo = cityData[cd]
              }
            }
          } else if (visualType === 'geoCountry') {
            return
          } else {
            areaVal = ''
          }

          if (areaGeo) {
            if (areaVal) {
              if (!tree[areaVal]) {
                tree[areaVal] = {
                  lon: areaGeo.lon,
                  lat: areaGeo.lat,
                  value: 0,
                  children: {}
                }
              }
              tree[areaVal].value = ds[`${m.agg}(${decodedMetricName})`]

              // todo: 除去显示城市／省的
              const group = ['name', 'sex']
              if (group.length) {
                group.forEach((g) => {
                  if (!tree[areaVal].children[ds[g]]) {
                    tree[areaVal].children[ds[g]] = 0
                  }
                  tree[areaVal].children[ds[g]] = safeAddition(tree[areaVal].children[ds[g]], Number(ds[`${m.agg}(${decodedMetricName})`]))
                })
              }
            }
          }
        })
        return tree
      }, {})
      visualMapMax = Math.max(...data.map((d) => d[`${m.agg}(${decodedMetricName})`] || 0))
    } else {
      dataTree = {}
    }
    console.log('dataTree', dataTree)
  })

  // series 数据项
  const metricArr = []

  scatterOptions = {
    symbolSize: 12,
    ...labelOption
  }
  const optionsType = layerType === 'scatter' ? scatterOptions : heatmapOptions
  const serieObj = layerType === 'map'
    ? {
      name: '地图',
      type: 'map',
      mapType: 'china',
      roam,
      data: Object.keys(dataTree).map((key, index) => {
        const { lon, lat, value } = dataTree[key]
        return {
          name: key,
          value: [lon, lat, value]
        }
      })
    }
    : {
      name: layerType === 'scatter' ? '气泡图' : '热力图',
      type: layerType || 'scatter',
      coordinateSystem: 'geo',
      data: Object.keys(dataTree).map((key, index) => {
        const { lon, lat, value } = dataTree[key]
        return {
          name: key,
          value: [lon, lat, value]
        }
      }),
      ...optionsType,
      symbolSize: chartStyles.label.labelFontSize
    }

  metricArr.push(serieObj)
  metricOptions = {
    series: metricArr
  }

  if (chartStyles.visualMap) {
    const {
      showVisualMap,
      visualMapPosition,
      fontFamily,
      fontSize,
      visualMapDirection,
      visualMapWidth,
      visualMapHeight,
      startColor,
      endColor
    } = chartStyles.visualMap

    let positionValue
    switch (visualMapPosition) {
      case 'leftBottom':
        positionValue = {
          left: 'left',
          top: 'bottom'
        }
        break
      case 'leftTop':
        positionValue = {
          left: 'left',
          top: 'top'
        }
        break
      case 'rightTop':
        positionValue = {
          left: 'right',
          top: 'top'
        }
        break
      case 'rightBottom':
        positionValue = {
          left: 'right',
          top: 'bottom'
        }
        break
    }

    visualMapOptions = {
      visualMap: {
        show: showVisualMap,
        min: 0,
        max: visualMapMax,
        calculable: true,
        inRange: {
          color: [startColor, endColor]
        },
        ...positionValue,
        itemWidth: visualMapWidth,
        itemHeight: visualMapHeight,
        textStyle: {
          fontFamily,
          fontSize
        },
        orient: visualMapDirection
      }
    }
  } else {
    visualMapOptions = {
      visualMap: {
        show: false,
        min: 0,
        max: visualMapMax,
        calculable: true,
        inRange: {
          color: DEFAULT_ECHARTS_THEME.visualMapColor
        },
        left: 10,
        bottom: 20,
        itemWidth: 20,
        itemHeight: 50,
        textStyle: {
          fontFamily: 'PingFang SC',
          fontSize: 12
        },
        orient: 'vertical'
      }
    }
  }

  const tooltipOptions = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const treeNode = dataTree[params.name]
        let content = treeNode ? `${params.name}：${treeNode.value}` : ''

        const groupContent = Object.keys(treeNode.children).map((k) => `${k}：${treeNode.children[k]}<br/>`).join('')
        content += `<br/>${groupContent}`

        return content
      }
    }
  }

  const mapOptions = layerType === 'map'
    ? {
      ...metricOptions,
      ...visualMapOptions
    }
    : {
      geo: {
        map: 'china',
        // ...labelOption,
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
        roam
      },
      ...metricOptions,
      ...visualMapOptions,
      ...tooltipOptions
    }

  return mapOptions
}
