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

import React, { useContext } from 'react'

import { LayerContext } from './util'
import { GraphTypes, SecondaryGraphTypes } from '../Setting'

import { Chart, Rectangle, Label, Video, Timer } from './Content'

const LayerCore: React.FC = (props) => {
  const { layer, operationInfo } = useContext(LayerContext)
  const { type, subType } = layer
  if (type === GraphTypes.Chart) {
    return <Chart />
  }
  if (type === GraphTypes.Secondary) {
    switch (subType) {
      case SecondaryGraphTypes.Rectangle:
        return <Rectangle />
      case SecondaryGraphTypes.Label:
        return <Label />
      case SecondaryGraphTypes.Video:
        return <Video />
      case SecondaryGraphTypes.Timer:
        return <Timer />
    }
  }
  return <div>123</div>
}

export default LayerCore
