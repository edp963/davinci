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

import { IReferenceLine, IReferenceBand } from './types'
import { ReferenceValueType, ReferenceLabelPosition } from './constants'
import {
  PIVOT_CHART_FONT_FAMILIES,
  PIVOT_DEFAULT_FONT_COLOR,
  CHART_LABEL_POSITIONS
} from 'app/globalConstants'
import defaultTheme from 'assets/json/echartsThemes/default.project.json'
const defaultThemeColors = defaultTheme.theme.color

export function getDefaultReferenceLineData(): Pick<IReferenceLine, 'data'> {
  return {
    data: {
      metric: void 0,
      type: ReferenceValueType.Constant,
      value: 0,
      label: {
        visible: false,
        position: ReferenceLabelPosition.Start,
        font: {
          size: '12',
          family: PIVOT_CHART_FONT_FAMILIES[0].value,
          // style: string,
          // weight: string,
          color: PIVOT_DEFAULT_FONT_COLOR
        }
      },
      line: {
        width: 1,
        type: 'solid',
        color: defaultThemeColors[0]
      }
    }
  }
}

export function getDefaultReferenceBandData(): Pick<IReferenceBand, 'data'> {
  return {
    data: [
      {
        metric: void 0,
        type: ReferenceValueType.Constant,
        value: 0
      },
      {
        metric: void 0,
        type: ReferenceValueType.Constant,
        value: 0,
        label: {
          visible: false,
          position: CHART_LABEL_POSITIONS[0].value,
          font: {
            size: '12',
            family: PIVOT_CHART_FONT_FAMILIES[0].value,
            // style: string,
            // weight: string,
            color: PIVOT_DEFAULT_FONT_COLOR
          }
        },
        band: {
          color: defaultThemeColors[0],
          border: {
            width: 0,
            type: 'solid',
            color: '#000'
          }
        }
      }
    ]
  }
}
