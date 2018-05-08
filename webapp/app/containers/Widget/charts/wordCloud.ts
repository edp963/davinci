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
 * WordCloud chart options generator
 */

export default function (dataSource, flatInfo, chartParams) {
  const {
    title,
    gridSize,
    sizeRangeX,
    sizeRangeY
  } = chartParams

  let metricOptions
  let gridSizeOption
  let sizeRangeOption
  let gridOptions

  // series 数据项
  const metricArr = []

  gridSizeOption = gridSize && {
    gridSize
  }

  sizeRangeOption = (sizeRangeX || sizeRangeY) && {
    sizeRange: [sizeRangeX || 0, sizeRangeY || 0]
  }

  const grouped = dataSource.reduce((acc, val) => {
    const objName = val[title]
    if (acc[objName]) {
      acc[objName].value += 1
    } else {
      acc[objName] = {
        name: objName,
        value: 1
      }
    }
    return acc
  }, {})

  const serieObj = {
    type: 'wordCloud',
    textStyle: {
      normal: {
        color: '#509af2'
      },
      emphasis: {
        shadowBlur: 10,
        shadowColor: '#509af2'
      }
    },
    data: Object.keys(grouped).map((k) => grouped[k]),
    rotationStep: 45,
    rotationRange: [-90, 90],
    ...gridSizeOption,
    ...sizeRangeOption
  }

  metricArr.push(serieObj)
  metricOptions = {
    series: metricArr
  }

  // grid
  gridOptions = {
    grid: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }
  }

  return {
    ...metricOptions,
    ...gridOptions
  }
}
