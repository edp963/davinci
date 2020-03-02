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

import { createContext, useState, useCallback } from 'react'
import { DisplayDefaultGridSize } from '../Setting'

type ContainerContextValue = {
  scale: [number, number]
  grid: [number, number]
  zoomRatio: number
  sliderValue: number
  slideTranslate: [number, number]
  scaleChange: (newScale: [number, number]) => void
  sliderChange: (newSliderValue: number) => void
  slideTranslateChange: (newTranslate: [number, number]) => void
  zoomIn: () => void
  zoomOut: () => void
}

const DefaultContainerContextValue: ContainerContextValue = {
  scale: [1, 1],
  grid: [DisplayDefaultGridSize, DisplayDefaultGridSize],
  zoomRatio: 1,
  sliderValue: 20,
  slideTranslate: [0, 0],
  scaleChange: () => {},
  sliderChange: () => {},
  slideTranslateChange: () => {},
  zoomIn: () => {},
  zoomOut: () => {}
}

export const ContainerContext = createContext<ContainerContextValue>(DefaultContainerContextValue)

export const useContainerContext = (
  grid: [number, number] = [DisplayDefaultGridSize, DisplayDefaultGridSize]
): ContainerContextValue => {
  const [scale, setScale] = useState(DefaultContainerContextValue.scale)
  const [zoomRatio, setZoomRatio] = useState(DefaultContainerContextValue.zoomRatio)
  const [sliderValue, setSliderValue] = useState(DefaultContainerContextValue.sliderValue)
  const [slideTranslate, setSlideTranslate] = useState<
    ContainerContextValue['slideTranslate']
  >(DefaultContainerContextValue.slideTranslate)

  const sliderChange = useCallback((newSliderValue: number) => {
    const newZoomRatio = newSliderValue / 40 + 0.5
    setSliderValue(newSliderValue)
    setZoomRatio(newZoomRatio)
  }, [])

  const zoomIn = useCallback(() => {
    sliderChange(Math.max(sliderValue - 10, 0))
  }, [sliderValue])

  const zoomOut = useCallback(() => {
    sliderChange(Math.max(sliderValue + 10, 0))
  }, [sliderValue])

  const scaleChange = useCallback(
    (nextScale: [number, number]) => {
      if (nextScale.join() !== scale.join()) {
        setScale(nextScale)
      }
    },
    [scale]
  )

  const slideTranslateChange = useCallback(
    (nextSlideTranslate: [number, number]) => {
      if (nextSlideTranslate !== slideTranslate) {
        setSlideTranslate(nextSlideTranslate)
      }
    },
    [slideTranslate]
  )

  return {
    scale,
    grid,
    zoomRatio,
    sliderValue,
    slideTranslate,
    scaleChange,
    sliderChange,
    slideTranslateChange,
    zoomIn,
    zoomOut
  }
}
