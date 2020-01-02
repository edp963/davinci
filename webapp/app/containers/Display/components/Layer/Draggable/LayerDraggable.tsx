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

import React, { useContext, useCallback } from 'react'
import { ContainerContext } from '../../Container/ContainerContext'
import { LayerListContext, LayerContext } from '../util'

import { DraggableCore, DraggableEventHandler } from 'react-draggable'
import { DraggableProxy } from './DraggableProxy'
import { DeltaPosition } from '../types'

// @FIX when update react-draggble in next versions
// to fix react-draggble@4.2.0 DraggableCore delta param in float value when scale is not 1
const adjustDelta = (deltaX: number, deltaY: number): DeltaPosition => ({
  deltaX: Math.round(deltaX),
  deltaY: Math.round(deltaY)
})

const LayerDraggable: React.FC = (props) => {
  const { scale, grid } = useContext(ContainerContext)
  const { onDrag } = useContext(LayerListContext)
  const {
    layer: { id: layerId }
  } = useContext(LayerContext)

  const start: DraggableEventHandler = useCallback((e, data) => {
    e.stopPropagation()
    if (e.target === data.node.lastElementChild) {
      return false
    }
    if (
      typeof (e as MouseEvent).button === 'number' &&
      (e as MouseEvent).button !== 0
    ) {
      return false
    }
  }, [])

  const drag: DraggableEventHandler = useCallback(
    (e, { deltaX, deltaY }) => {
      e.stopPropagation()
      onDrag(layerId, adjustDelta(deltaX, deltaY))
    },
    [layerId, onDrag]
  )

  const stop: DraggableEventHandler = useCallback(
    (e, { deltaX, deltaY }) => {
      e.stopPropagation()
      onDrag(layerId, adjustDelta(deltaX, deltaY), true)
    },
    [layerId, onDrag]
  )

  return (
    <DraggableCore
      allowAnyClick
      grid={grid}
      scale={scale[0]}
      onStart={start}
      onStop={stop}
      onDrag={drag}
      handle=".display-slide-layer"
    >
      <DraggableProxy>{props.children}</DraggableProxy>
    </DraggableCore>
  )
}

export default LayerDraggable
