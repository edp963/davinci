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

import produce from 'immer'
import { LayerAlignmentTypes } from './types'
import { ILayerFormed } from '../../types'

export const setLayersAlignment = (
  layers: ILayerFormed[],
  alignmentType: LayerAlignmentTypes
) => {
  if (!layers.length) {
    return []
  }

  const [minPosX, minPosY, rightX, bottomY] = layers.reduce(
    (
      [minX, minY, rightX, bottomY],
      { params: { positionX, positionY, width, height } }
    ) => [
      Math.min(minX, positionX),
      Math.min(minY, positionY),
      Math.max(positionX + width, rightX),
      Math.max(positionY + height, bottomY)
    ],
    [Infinity, Infinity, 0, 0]
  )

  const updateLayers = produce(layers, (draft) => {
    switch (alignmentType) {
      case LayerAlignmentTypes.Top:
        layers.forEach((l) => {
          l.params.positionY = minPosY
        })
        break
      case LayerAlignmentTypes.Left:
        layers.forEach((l) => {
          l.params.positionX = minPosX
        })
        break
      case LayerAlignmentTypes.Bottom:
        layers.forEach((l) => {
          l.params.positionY = bottomY - l.params.height
        })
        break
      case LayerAlignmentTypes.Right:
        layers.forEach((l) => {
          l.params.positionX = rightX - l.params.width
        })
        break
      case LayerAlignmentTypes.HorizontalCenter:
        const midPosX = (minPosX + rightX) / 2
        layers.forEach((l) => {
          l.params.positionX = midPosX - l.params.width / 2
        })
        break
      case LayerAlignmentTypes.VerticalCenter:
        const midPosY = (minPosY + bottomY) / 2
        layers.forEach((l) => {
          l.params.positionY = minPosY - l.params.height / 2
        })
        break
    }
  })

  return updateLayers
}
