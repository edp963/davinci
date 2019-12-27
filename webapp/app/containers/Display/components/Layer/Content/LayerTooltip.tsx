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
import { Tooltip } from 'antd'

import { LayerContext } from '../util'

const LayerTooltip: React.FC = (props) => {
  const {
    operationInfo,
    layer: { params }
  } = useContext(LayerContext)
  const { resizing, dragging } = operationInfo
  const { positionX, positionY, width, height } = params
  let tooltip: string
  if (resizing) {
    tooltip = `宽度：${width}px，高度：${height}px`
  } else if (dragging) {
    tooltip = `x：${positionX}px，y：${positionY}px`
  }
  return (
    <Tooltip title={tooltip} placement="right" visible={resizing || dragging}>
      {props.children}
    </Tooltip>
  )
}

export default LayerTooltip
