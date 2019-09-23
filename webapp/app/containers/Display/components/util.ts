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

import slide from 'assets/json/slideSettings/slide.json'
import chart from 'assets/json/slideSettings/chart.json'
import rectangle from 'assets/json/slideSettings/rectangle.json'
import label from 'assets/json/slideSettings/label.json'
import video from 'assets/json/slideSettings/video.json'
import timer from 'assets/json/slideSettings/timer.json'

import { ILayer, ILayerParams, IBaseline, IDeltaPosition, IDeltaSize } from './LayerItem'
import { ISlideParams } from './types'

import { DEFAULT_BASELINE_THICKNESS } from 'app/globalConstants'

export enum SecondaryGraphTypes {
  Rectangle = 20,
  Label = 21,
  Video = 22,
  Timer = 23
}

export enum GraphTypes {
  Slide,
  Chart,
  Secondary
}

export enum OrderDirection {
  Asc,
  Desc
}

export const slideSettings = {
  [GraphTypes.Slide]: slide,
  [GraphTypes.Chart]: chart,
  [SecondaryGraphTypes.Rectangle]: rectangle,
  [SecondaryGraphTypes.Label]: label,
  [SecondaryGraphTypes.Video]: video,
  [SecondaryGraphTypes.Timer]: timer
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

export const captureVideosWithImages = () => {
  const canvas = this.canvas || document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const videos = document.querySelectorAll('video')
  Array.prototype.forEach.call(videos, (v) => {
    if (!v.src) { return }

    try {
      const { videoWidth, videoHeight } = v
      canvas.width = videoWidth
      canvas.height = videoHeight
      ctx.fillRect(0, 0, videoWidth, videoHeight)
      ctx.drawImage(v, 0, 0, videoWidth, videoHeight)
      v.style.backgroundImage = `url(${canvas.toDataURL()})`
      v.style.backgroundSize = 'cover'
      console.log('v.style: ', v.style)
      ctx.clearRect(0, 0, videoWidth, videoHeight)
    } catch (e) {
      console.log('e: ', e)
      return
    }
  })
}

const baselineDivisions: number[] = [ 4, 3, 2 ]

export function computeEditorBaselines (
  otherLayers: ILayer[], currentEditLayers: ILayer[],
  slideParams: ISlideParams, gridDistance: number, scale: number,
  delta: IDeltaPosition & IDeltaSize, adjustType: IBaseline['adjustType']
) {
  const { deltaX, deltaY, deltaWidth, deltaHeight } = delta

  const mapLayerParams: { [layerId: number]: ILayerParams } = currentEditLayers.reduce((acc, layer) => {
    acc[layer.id] = JSON.parse(layer.params)
    return acc
  }, {})

  const minX = currentEditLayers.reduce((min, layer) => Math.min(min, mapLayerParams[layer.id].positionX + deltaX), Infinity)
  const maxX = currentEditLayers.reduce((max, layer) => {
    const { positionX, width } = mapLayerParams[layer.id]
    return Math.max(max, positionX + deltaX + width + deltaWidth)
  }, -Infinity)

  const minY = currentEditLayers.reduce((min, layer) => Math.min(min, mapLayerParams[layer.id].positionY + deltaY), Infinity)
  const maxY = currentEditLayers.reduce((max, layer) => {
    const { positionY, height } = mapLayerParams[layer.id]
    return Math.max(max, positionY + deltaY + height + deltaHeight)
  }, -Infinity)

  const baselinesSlide = computeSlideBaselines(minX, maxX, minY, maxY, slideParams, gridDistance, scale, adjustType)
  const baselinesLayers = computeLayersBaselines(minX, maxX, minY, maxY, slideParams, gridDistance, scale, adjustType, otherLayers)

  const baselineVertical = [...baselinesSlide.vertical, ...baselinesLayers.vertical].reduce((acc, baseline) => (
    !acc || acc.adjust[0] > baseline.adjust[0] ? baseline : acc
  ), null)
  const baselineHorizontal = [...baselinesSlide.horizontal, ...baselinesLayers.horizontal].reduce((acc, baseline) => (
    !acc || acc.adjust[1] > baseline.adjust[1] ? baseline : acc
  ), null)
  const baselines = [baselineVertical, baselineHorizontal].filter((bl) => !!bl)
  return baselines
}

function computeSlideBaselines (
  minX: number, maxX: number,
  minY: number, maxY: number,
  slideParams: ISlideParams, gridDistance: number, scale: number,
  adjustType: IBaseline['adjustType']
) {
  const { width: slideWidth, height: slideHeight } = slideParams
  const middleX = (minX + maxX) / 2
  const middleY = (minY + maxY) / 2

  const baselinesVertical: IBaseline[] = []
  const baselinesHorizontal: IBaseline[] = []

  baselineDivisions.some((division) => {
    let step = 1
    while (step < division) {
      const baseX = Math.round(slideWidth / division * step)
      const baseY = Math.round(slideHeight / division * step)
      step++

      const marginX = Math.round(baseX - middleX)
      const marginY = Math.round(baseY - middleY)

      if (Math.abs(marginX) < gridDistance && baselinesVertical.length === 0) { // may not accurate when lacking of slideWidth
        baselinesVertical.push({
          top: 0,
          right: slideWidth - baseX - DEFAULT_BASELINE_THICKNESS / scale,
          bottom: 0,
          left: baseX,
          adjust: [marginX, 0],
          adjustType
        })
      }
      if (Math.abs(marginY) < gridDistance && baselinesHorizontal.length === 0) {
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

function computeLayersBaselines (
  minX: number, maxX: number,
  minY: number, maxY: number,
  slideParams: ISlideParams, gridDistance: number, scale: number,
  adjustType: IBaseline['adjustType'],
  otherLayers: ILayer[]
) {
  const { width: slideWidth, height: slideHeight } = slideParams
  const middleX = (minX + maxX) / 2
  const middleY = (minY + maxY) / 2
  const mapOtherLayerParams: { [layerId: number]: ILayerParams } = otherLayers.reduce((acc, layer) => {
    acc[layer.id] = JSON.parse(layer.params)
    return acc
  }, {})

  const baselinesVertical: IBaseline[] = []
  const baselinesHorizontal: IBaseline[] = []

  otherLayers.forEach((layer) => {
    const layerParams = mapOtherLayerParams[layer.id]
    const { positionX, positionY, width, height } = layerParams

    const middleBaseX = positionX + width / 2
    const middleBaseY = positionY + height / 2

    const marginX = Math.round(middleBaseX - middleX)
    const marginY = Math.round(middleBaseY - middleY)
    if (Math.abs(marginX) < gridDistance) {
      if (baselinesVertical.length === 0 || Math.abs(baselinesVertical[0].adjust[0]) > Math.abs(marginX)) {
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
    if (Math.abs(marginY) < gridDistance) {
      if (baselinesHorizontal.length === 0 || Math.abs(baselinesHorizontal[0].adjust[1]) > Math.abs(marginY)) {
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
