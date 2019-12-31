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

import { ISlideParams } from 'containers/Viz/types'
import { ILayerParams } from './types'

export { computeEditorBaselines } from './Container/Slide/util'
export { setLayersAlignment } from './Setting/Alignment/util'

import { GraphTypes, SecondaryGraphTypes, slideSettings } from './constants'

export function getDefaultSlideParams() {
  const params = (slide as any).params
  const defaultSlideParams = {}
  params.forEach((param) => {
    param.items.forEach((item) => {
      defaultSlideParams[item.name] = item.default || null
    })
  })
  return defaultSlideParams as ISlideParams
}

export function getDefaultLayerSetting(
  graphType: GraphTypes,
  secondaryGraphType?: SecondaryGraphTypes
) {
  const defaultSetting = {}
  const type = secondaryGraphType || graphType
  const setting = slideSettings[type]
  if (!setting) {
    return defaultSetting as ILayerParams
  }
  setting.params.forEach((param) => {
    param.items.forEach((item) => {
      defaultSetting[item.name] = item.default || null
    })
  })
  return defaultSetting as ILayerParams
}

export const captureVideosWithImages = () => {
  const canvas = this.canvas || document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const videos = document.querySelectorAll('video')
  Array.prototype.forEach.call(videos, (v) => {
    if (!v.src) {
      return
    }

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

