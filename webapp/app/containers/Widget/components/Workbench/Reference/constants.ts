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

import ChartTypes from 'app/containers/Widget/config/chart/ChartTypes'

export enum ReferenceType {
  Line = 'line',
  Band = 'band'
}

export enum ReferenceValueType {
  Constant = 'constant',
  Average = 'average',
  Max = 'max',
  Min = 'min'
}

export enum ReferenceLabelPosition {
  Start = 'start',
  Middle = 'middle',
  End = 'end'
}

export const ReferenceValueTypeLabels = {
  [ReferenceValueType.Constant]: '常量',
  [ReferenceValueType.Average]: '平均值',
  [ReferenceValueType.Max]: '最大值',
  [ReferenceValueType.Min]: '最小值'
}

export const ReferenceLabelPositionLabels = {
  [ReferenceLabelPosition.Start]: '起始',
  [ReferenceLabelPosition.Middle]: '中点',
  [ReferenceLabelPosition.End]: '结束'
}

export const REFERENCE_SUPPORTED_CHART_TYPES = [
  ChartTypes.Line,
  ChartTypes.Bar,
  ChartTypes.Scatter,
  ChartTypes.DoubleYAxis
]
