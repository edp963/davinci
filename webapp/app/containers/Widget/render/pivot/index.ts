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

import line from './line'
import bar from './bar'
import scatter from './scatter'
import pie from './pie'
import { IDrawingData } from '../../components/Pivot/Pivot'
import { DimetionType } from '../../components/Widget'

interface IChartOptions {
  chartOption: object
  stackOption?: boolean
  calcPieCenterAndRadius? (
    dimetionAxis: DimetionType,
    containerWidth: number,
    containerHeight: number,
    elementSize: number,
    unitMetricLengthArr: number[],
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
  ): { center: string[], radius: string[]}
  getSymbolSize? (name: string, size: number): number
}

export default function (type, drawingData?: IDrawingData): IChartOptions {
  switch (type) {
    case 'line': return line()
    case 'bar': return bar(drawingData.elementSize)
    case 'scatter': return scatter(drawingData.sizeRate)
    case 'pie': return pie()
  }
}
