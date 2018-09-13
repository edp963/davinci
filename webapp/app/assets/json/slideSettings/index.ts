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

import {
  GraphTypes,
  SecondaryGraphTypes } from 'utils/util'

import * as slide from './slide.json'
import * as chart from './chart.json'
import * as rectangle from './rectangle.json'
import * as label from './label.json'



export default {
  [GraphTypes.Slide]: slide,
  [GraphTypes.Chart]: chart,
  [SecondaryGraphTypes.Rectangle]: rectangle,
  [SecondaryGraphTypes.Label]: label
}

export function getDefaultSlideParams () {
  const params = (slide as any).params
  const defaultSlideParams = {}
  params.forEach((param) => {
    param.items.forEach((item) => {
      defaultSlideParams[item.name] = item.default || null
    })
  })
  return defaultSlideParams
}
