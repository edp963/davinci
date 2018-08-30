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

import { DimetionType } from '../components/Pivot/Pivot'

export default function () {
  return {
    chartOption: {
      type: 'pie'
    },
    calcPieCenterAndRadius (
      dimetionAxis: DimetionType,
      containerWidth,
      containerHeight,
      horizontalRecordCountOfCol: number,
      verticalRecordCountOfRow: number,
      lineRecordSum: number,
      lineCount: number,
      unitCount: number,
      metricCount: number,
      recordCount: number,
      lineIndex: number,
      unitIndex: number,
      metricIndex: number,
      recordIndex: number
    ): { center: string[], radius: string[]} {
      let center
      let radius
      if (dimetionAxis === 'col') {
        const verticalPer = 100 / lineCount / metricCount
        const horizontalPer = 100 / horizontalRecordCountOfCol
        center = [
          `${horizontalPer * (recordIndex + lineRecordSum + 1) - horizontalPer / 2}%`,
          `${verticalPer * (metricIndex + metricCount * lineIndex + 1) - verticalPer / 2}%`
        ]
        radius = containerWidth > containerHeight
          ? ['0%', `${100 / metricCount / lineCount * .6}%`]
          : ['0%', `${100 / horizontalRecordCountOfCol * .6}%`]
      } else {
        const verticalPer = 100 / verticalRecordCountOfRow
        const horizontalPer = 100 / unitCount / metricCount
        center = [
          `${horizontalPer * (metricIndex + metricCount * unitIndex + 1) - horizontalPer / 2}%`,
          `${verticalPer * (verticalRecordCountOfRow - recordIndex - lineIndex * recordCount) - verticalPer / 2}%`
        ]
        radius = containerWidth > containerHeight
          ? ['0%', `${100 / verticalRecordCountOfRow * .6}%`]
          : ['0%', `${100 / metricCount / unitCount * .6}%`]
      }
      return { center, radius }
    }
  }
}
