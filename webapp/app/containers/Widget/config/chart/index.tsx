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

import { IChartInfo } from 'containers/Widget/components/Widget'

import table from './table'
import line from './line'
import bar from './bar'
import scatter from './scatter'
import pie from './pie'
import funnel from './funnel'
import radar from './radar'
import sankey from './sankey'
import parallel from './parallel'
import map from './map'
import wordCloud from './wordCloud'
import waterfall from './waterfall'
import scorecard from './scorecard'
import gauge from './gauge'
import iframe from './iframe'
import richText from './richText'
import doubleYAxis from './doubleYAxis'

const widgetlibs: IChartInfo[] = [
  table,
  scorecard,
  line,
  bar,
  scatter,
  pie,
  funnel,
  radar,
  sankey,
  parallel,
  map,
  wordCloud,
  waterfall,
  iframe,
  richText,
  doubleYAxis,
  gauge
]

export default widgetlibs
