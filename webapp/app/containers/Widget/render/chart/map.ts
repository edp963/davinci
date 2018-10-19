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
  getTextWidth,
  getSizeRate
} from '../../components/util'
import {
  getLegendOption,
  getLabelOption,
  getGridPositions,
  getSymbolSize
} from './util'
import {
  safeAddition
} from '../../../../utils/util'

import {
  DEFAULT_ECHARTS_THEME
} from '../../../../globalConstants'
import geoData from '../../../../assets/json/geo'

const provinceSuffix = ['省', '自治区', '市']
const citySuffix = ['自治州', '市', '区', '县', '旗', '盟', '镇']

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
        formatter: '{b}',
        position: labelPosition,
        show: showLabel,
        color: labelColor,
        fontFamily: labelFontFamily,
        fontSize: labelFontSize
      }
    }
  }

  let metricOptions
  let visualMapOptions

  const dataTree = {}
  let min = 0
  let max = 0

  const agg = metrics[0].agg
  const metricName = decodeMetricName(metrics[0].name)

  data.forEach((record) => {
    let areaVal
    const group = []

    const value = record[`${agg}(${metricName})`]
    min = Math.min(min, value)
    max = Math.max(max, value)

    cols.forEach((col) => {
      const { visualType } = model[col]
      // todo
      if (visualType === 'geoProvince') {
        areaVal = record[col]
        const hasSuffix = provinceSuffix.some((p) => areaVal.includes(p))
        const area = hasSuffix
          ? geoData.find((d) => d.name === areaVal)
          : geoData.find((d) => d.name.includes(areaVal))
        if (area) {
          if (!dataTree[areaVal]) {
            dataTree[areaVal] = {
              lon: area.lon,
              lat: area.lat,
              value,
              children: {}
            }
          }
        }
      } else if (visualType === 'geoCity') {
        areaVal = record[col]
        const hasSuffix = citySuffix.some((p) => areaVal.includes(p))
        const area = hasSuffix
          ? geoData.find((d) => d.name === areaVal)
          : geoData.find((d) => d.name.includes(areaVal))
        if (area) {
          if (layerType === 'map') {
            const provinceParent = getProvinceParent(area)
            const parentName = getProvinceName(provinceParent.name)
            if (!dataTree[parentName]) {
              dataTree[parentName] = {
                lon: area.lon,
                lat: area.lat,
                value: 0,
                children: {}
              }
            }
            dataTree[parentName].value += value
          } else {
            if (!dataTree[areaVal]) {
              dataTree[areaVal] = {
                lon: area.lon,
                lat: area.lat,
                value,
                children: {}
              }
            }
          }
        }
      }

      // todo: 除去显示城市／省的
      // const group = ['name', 'sex']
      // if (group.length) {
      //   group.forEach((g) => {
      //     if (!dataTree[areaVal].children[record[g]]) {
      //       dataTree[areaVal].children[record[g]] = 0
      //     }
      //     dataTree[areaVal].children[record[g]] = safeAddition(dataTree[areaVal].children[record[g]], Number(value))
      //   })
      // }
    })
  })

  // series 数据项
  const metricArr = []

  const sizeRate = getSizeRate(min, max)

  const optionsType = layerType === 'scatter' ? {} : {
    blurSize: 40
  }

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
      }),
      ...labelOption
    }
    : {
      name: layerType === 'scatter' ? '气泡图' : '热力图',
      type: layerType || 'scatter',
      coordinateSystem: 'geo',
      data: Object.keys(dataTree).map((key, index) => {
        const { lon, lat, value } = dataTree[key]
        return {
          name: key,
          value: [lon, lat, value],
          symbolSize: getSymbolSize(sizeRate, value) / 2
        }
      }),
      ...labelOption,
      ...optionsType
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
        min,
        max,
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
        min,
        max,
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
      trigger: 'item'
      // formatter: (params) => {
      //   const treeNode = dataTree[params.name]
      //   let content = treeNode ? `${params.name}：${treeNode.value}` : ''

      //   const groupContent = Object.keys(treeNode.children).map((k) => `${k}：${treeNode.children[k]}<br/>`).join('')
      //   content += `<br/>${groupContent}`

      //   return content
      // }
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

function getProvinceParent (area) {
  if (!area.parent) {
    return area
  }
  const parent = geoData.find((g) => g.id === area.parent)
  return !parent.parent ? parent : getProvinceParent(parent)
}

function getProvinceName (name) {
  provinceSuffix.forEach((ps) => {
    if (name.includes(ps)) {
      name = name.replace(ps, '')
    }
  })
  return name
}
