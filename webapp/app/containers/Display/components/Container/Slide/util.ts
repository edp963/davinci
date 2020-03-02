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

import { ILayerFormed } from "../../types"
import { ISlideParams } from "containers/Viz/types"
import { DeltaPosition, DeltaSize } from 'containers/Display/components/Layer'
import { IBaseline } from './types'

import { DEFAULT_BASELINE_DIVISIONS, DEFAULT_BASELINE_THICKNESS } from './constants'

export function computeEditorBaselines(
  operatingLayers: ILayerFormed[],
  otherLayers: ILayerFormed[],
  slideSize: Pick<ISlideParams, 'width' | 'height'>,
  grid: [number, number],
  scale: number,
  delta: DeltaPosition & DeltaSize,
  adjustType: IBaseline['adjustType']
) {
  const { deltaX, deltaY, deltaWidth, deltaHeight } = delta

  const rect = operatingLayers.reduce<[number, number, number, number]>(
    ([minX, maxX, minY, maxY], layer) => {
      const { positionX, positionY, width, height } = layer.params
      return [
        Math.min(minX, positionX + deltaX),
        Math.max(maxX, positionX + deltaX + width + deltaWidth),
        Math.min(minY, positionY + deltaY),
        Math.max(maxY, positionY + deltaY + height + deltaHeight)
      ]
    },
    [Infinity, -Infinity, Infinity, -Infinity]
  )

  const baselinesSlide = computeSlideBaselines(
    rect,
    slideSize,
    grid,
    scale,
    adjustType
  )

  const baselinesLayers = computeLayersBaselines(
    rect,
    slideSize,
    grid,
    scale,
    adjustType,
    otherLayers
  )

  const baselineVertical = [
    ...baselinesSlide.vertical,
    ...baselinesLayers.vertical
  ].reduce(
    (acc, baseline) =>
      !acc || acc.adjust[0] > baseline.adjust[0] ? baseline : acc,
    null
  )
  const baselineHorizontal = [
    ...baselinesSlide.horizontal,
    ...baselinesLayers.horizontal
  ].reduce(
    (acc, baseline) =>
      !acc || acc.adjust[1] > baseline.adjust[1] ? baseline : acc,
    null
  )
  const baselines = [baselineVertical, baselineHorizontal].filter((bl) => !!bl)
  return baselines
}

function computeSlideBaselines(
  [minX, maxX, minY, maxY]: [number, number, number, number],
  slideSize: Pick<ISlideParams, 'width' | 'height'>,
  grid: [number, number],
  scale: number,
  adjustType: IBaseline['adjustType']
) {
  const { width: slideWidth, height: slideHeight } = slideSize
  const middleX = (minX + maxX) / 2
  const middleY = (minY + maxY) / 2

  const baselinesVertical: IBaseline[] = []
  const baselinesHorizontal: IBaseline[] = []

  DEFAULT_BASELINE_DIVISIONS.some((division) => {
    let step = 0
    while (step < division) {
      const baseX = step ? Math.round((slideWidth / division) * step) : 0
      const baseY = step ? Math.round((slideHeight / division) * step) : 0
      step++

      const marginX = Math.round(baseX - middleX)
      const marginY = Math.round(baseY - middleY)

      if (Math.abs(marginX) < grid[0] && baselinesVertical.length === 0) {
        // may not accurate when lacking of slideWidth
        baselinesVertical.push({
          top: 0,
          right: slideWidth - baseX - DEFAULT_BASELINE_THICKNESS / scale,
          bottom: 0,
          left: baseX,
          adjust: [marginX, 0],
          adjustType
        })
      }
      if (Math.abs(marginY) < grid[1] && baselinesHorizontal.length === 0) {
        baselinesHorizontal.push({
          top: baseY,
          right: 0,
          bottom: slideHeight - baseY - DEFAULT_BASELINE_THICKNESS / scale,
          left: 0,
          adjust: [0, marginY],
          adjustType
        })
      }
      if (baselinesVertical.length && baselinesHorizontal.length) {
        return true
      }
    }
    return false
  })

  const baselines = {
    vertical: baselinesVertical,
    horizontal: baselinesHorizontal
  }
  return baselines
}

function computeLayersBaselines(
  [minX, maxX, minY, maxY]: [number, number, number, number],
  slideSize: Pick<ISlideParams, 'width' | 'height'>,
  grid: [number, number],
  scale: number,
  adjustType: IBaseline['adjustType'],
  otherLayers: ILayerFormed[]
) {
  const { width: slideWidth, height: slideHeight } = slideSize
  const middleX = (minX + maxX) / 2
  const middleY = (minY + maxY) / 2

  const baselinesVertical: IBaseline[] = []
  const baselinesHorizontal: IBaseline[] = []

  otherLayers.forEach((layer) => {
    const { positionX, positionY, width, height } = layer.params

    const middleBaseX = positionX + width / 2
    const middleBaseY = positionY + height / 2

    const marginX = Math.round(middleBaseX - middleX)
    const marginY = Math.round(middleBaseY - middleY)
    if (Math.abs(marginX) < grid[0]) {
      if (
        baselinesVertical.length === 0 ||
        Math.abs(baselinesVertical[0].adjust[0]) > Math.abs(marginX)
      ) {
        baselinesVertical.push({
          top: Math.min(positionY, minY),
          right: slideWidth - middleBaseX - DEFAULT_BASELINE_THICKNESS / scale,
          bottom: slideHeight - Math.max(positionY + height, maxY),
          left: middleBaseX,
          adjust: [marginX, 0],
          adjustType
        })
      }
    }
    if (Math.abs(marginY) < grid[1]) {
      if (
        baselinesHorizontal.length === 0 ||
        Math.abs(baselinesHorizontal[0].adjust[1]) > Math.abs(marginY)
      ) {
        baselinesHorizontal.push({
          top: middleY,
          right: slideWidth - Math.max(positionX + width, maxX),
          bottom: slideHeight - middleY - DEFAULT_BASELINE_THICKNESS / scale,
          left: Math.min(positionX, minX),
          adjust: [0, marginY],
          adjustType
        })
      }
    }
  })

  const baselines = {
    vertical: baselinesVertical,
    horizontal: baselinesHorizontal
  }
  return baselines
}
