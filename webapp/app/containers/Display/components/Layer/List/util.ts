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

import { LayerOrderDirection } from './constants'
import { ILayerFormed } from '../../types'

const sortLayers = (
  layers: ILayerFormed[],
  orderDirection: LayerOrderDirection
): ILayerFormed[] => {
  if (!Array.isArray(layers)) {
    return []
  }

  const sortedLayers = [...layers]
  switch (orderDirection) {
    case LayerOrderDirection.Asc:
      sortedLayers.sort((item1, item2) => item1.index - item2.index)
      break
    case LayerOrderDirection.Desc:
      sortedLayers.sort((item1, item2) => item2.index - item1.index)
      break
    default:
      break
  }
  return sortedLayers
}

const swapLayerIndex = (
  orderedSelectedLayers: ILayerFormed[],
  orderedLayers: ILayerFormed[]
) => {
  const updatedLayers: ILayerFormed[] = []
  orderedSelectedLayers.forEach((layer) => {
    const idx = orderedLayers.findIndex((l) => l.id === layer.id)
    if (
      idx === 0 ||
      orderedSelectedLayers.findIndex(
        (l) => l.id === orderedLayers[idx - 1].id
      ) >= 0
    ) {
      return
    }

    const tempIndex = orderedLayers[idx].index
    orderedLayers[idx].index = orderedLayers[idx - 1].index
    orderedLayers[idx - 1].index = tempIndex
    const temp = orderedLayers[idx]
    orderedLayers[idx] = orderedLayers[idx - 1]
    orderedLayers[idx - 1] = temp

    const currentLayers = [orderedLayers[idx], orderedLayers[idx - 1]]
    currentLayers.forEach((item) => {
      const exists = updatedLayers.findIndex((l) => l.id === item.id)
      if (exists < 0) {
        updatedLayers.push({ ...item })
      } else {
        updatedLayers.splice(exists, 1, { ...item })
      }
    })
  })

  return updatedLayers
}

export const bringToUpper = (
  selectedLayers: ILayerFormed[],
  layers: ILayerFormed[]
) => {
  const descSelectedLayers = sortLayers(selectedLayers, LayerOrderDirection.Desc)
  const descLayers = sortLayers(layers, LayerOrderDirection.Desc)
  return swapLayerIndex(descSelectedLayers, descLayers)
}

export const sendToNext = (
  selectedLayers: ILayerFormed[],
  layers: ILayerFormed[]
) => {
  const ascSelectedLayers = sortLayers(selectedLayers, LayerOrderDirection.Asc)
  const ascLayers = sortLayers(layers, LayerOrderDirection.Asc)
  return swapLayerIndex(ascSelectedLayers, ascLayers)
}

export const bringToFront = (
  selectedLayers: ILayerFormed[],
  layers: ILayerFormed[]
) => {
  if (selectedLayers.length <= 0) {
    return []
  }

  const maxLayerIndex = layers.reduce(
    (acc, layer) => Math.max(layer.index, acc),
    -Infinity
  )
  const updateLayers = sortLayers(selectedLayers, LayerOrderDirection.Asc).map<
    ILayerFormed
  >((layer, idx) => ({
    ...layer,
    index: maxLayerIndex + idx + 1
  }))
  return updateLayers
}

export const sendToBottom = (
  selectedLayers: ILayerFormed[],
  layers: ILayerFormed[]
) => {
  if (selectedLayers.length <= 0) {
    return []
  }

  const minLayerIndex = layers.reduce(
    (acc, layer) => Math.min(layer.index, acc),
    Infinity
  )
  const updateLayers = sortLayers(selectedLayers, LayerOrderDirection.Desc).map(
    (layer, idx) => ({
      ...layer,
      index: minLayerIndex - idx - 1
    })
  )
  return updateLayers
}
