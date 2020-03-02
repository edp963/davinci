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

import React, { useContext, useState, useEffect, useCallback } from 'react'
import {
  ContainerContext,
  SlideContext
} from 'containers/Display/components/Container'
import { LayerListContext, LayerContext } from '../util'

import { Resizable, ResizeCallbackData } from 'libs/react-resizable'
import { DeltaSize } from '../types'

const LayerResizable: React.FC = (props) => {
  const { scale, grid } = useContext(ContainerContext)
  const { slideParams } = useContext(SlideContext)

  const { onResize } = useContext(LayerListContext)
  const {
    layer: { id: layerId, params }
  } = useContext(LayerContext)

  const { width: slideWidth, height: slideHeight } = slideParams
  const { width, height, positionX, positionY } = params
  const maxConstraints: [number, number] = [
    slideWidth - positionX,
    slideHeight - positionY
  ]

  const resize = useCallback(
    (e: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      e.stopPropagation()
      const { width: newWidth, height: newHeight } = size
      onResize(layerId, { deltaWidth: newWidth - width, deltaHeight: newHeight - height })
    },
    [width, height, layerId, onResize]
  )

  const resizeStop = useCallback(
    (e: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      e.stopPropagation()
      const { width: newWidth, height: newHeight } = size
      const deltaSize: DeltaSize = { deltaWidth: newWidth - width, deltaHeight: newHeight - height }
      onResize(layerId, deltaSize, true)
    },
    [layerId, width, height, onResize]
  )

  return (
    <Resizable
      width={width}
      height={height}
      scale={scale[0]}
      onResize={resize}
      onResizeStop={resizeStop}
      draggableOpts={{ grid }}
      minConstraints={[50, 50]}
      maxConstraints={maxConstraints}
      handleSize={[20, 20]}
    >
      {props.children as React.ReactElement}
    </Resizable>
  )
}

export default LayerResizable
