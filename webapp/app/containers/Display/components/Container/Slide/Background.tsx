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

import React, { useContext, useMemo, useCallback, useEffect } from 'react'

import classnames from 'classnames'

import { useClientRect } from 'utils/hooks'
import { SlideContext } from './SlideContext'
import { ContainerContext } from '../ContainerContext'

import { DISPLAY_CONTAINER_PADDING } from './constants'
import { LayerOperations } from '../../constants'
import { DeltaPosition } from '../../Layer'
import { DragTriggerTypes } from 'app/containers/Display/constants'
import { ILayerOperationInfo } from 'app/containers/Display/components/types'
import { onLabelEditorSelectedRange } from 'app/containers/Display/components/Layer/RichText/util'
type KeyDownKeys =
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'Delete'
  | 'Backspace'
  | 'c'
  | 'C'
  | 'v'
  | 'V'
  | 'y'
  | 'Y'
  | 'z'
  | 'Z'

const ChangePositionKeys: KeyDownKeys[] = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight'
]

interface ISlideBackgroundProps {
  className?: string
  padding?: number
  autoFit?: boolean
  fullscreen?: boolean
  parentRef?: {
    current: HTMLDivElement
  }
  onChangeLayersPosition?: (
    deltaPosition: DeltaPosition,
    scale: number,
    eventTrigger: DragTriggerTypes
  ) => void
  onDoLayerOperation?: (operation: LayerOperations) => void
  onRemoveLayerOperationInfo?: (
    changedInfo: Pick<Partial<ILayerOperationInfo>, 'selected' | 'editing'>
  ) => void
}

const SlideBackground: React.FC<ISlideBackgroundProps> = (props) => {
  const {
    className,
    padding,
    autoFit,
    fullscreen,
    onChangeLayersPosition,
    onDoLayerOperation,
    onRemoveLayerOperationInfo,
    parentRef
  } = props
  const { slideParams } = useContext(SlideContext)
  const { width: slideWidth, height: slideHeight, scaleMode } = slideParams
  const containerContextValue = useContext(ContainerContext)
  const {
    scale,
    grid,
    zoomRatio,
    slideTranslate,
    scaleChange,
    slideTranslateChange
  } = containerContextValue
  const [rect, refBackground] = useClientRect<HTMLDivElement>()
  const [containerWidth, containerHeight] = useMemo(() => {
    if (!fullscreen && !rect) {
      return []
    }
    let width: number
    let height: number
    if (fullscreen) {
      width = window.document.documentElement.clientWidth
      height = window.document.documentElement.clientHeight
    } else {
      width = rect.width
      height = rect.height
    }
    return [width, height].map((item) => Math.max(zoomRatio, 1) * item)
  }, [fullscreen, rect, zoomRatio])

  let nextScale = useMemo<[number, number]>(() => {
    if (!containerWidth || !containerHeight) {
      return [0, 0]
    }

    const landscapeScale = ((containerWidth - padding) / slideWidth) * zoomRatio
    const portraitScale =
      ((containerHeight - padding) / slideHeight) * zoomRatio
    const newScale: [number, number] = new Array<number>(2) as [number, number]
    if (autoFit) {
      const fitScale =
        slideWidth / slideHeight > containerWidth / containerHeight
          ? landscapeScale
          : portraitScale
      newScale.fill(fitScale)
      return newScale
    }

    switch (scaleMode) {
      case 'noScale':
        newScale.fill(zoomRatio)
        break
      case 'scaleWidth':
        newScale.fill(landscapeScale)
        break
      case 'scaleHeight':
        newScale.fill(portraitScale)
        break
      case 'scaleFull':
        newScale[0] = landscapeScale
        newScale[1] = portraitScale
        break
    }
    return newScale
  }, [
    autoFit,
    containerWidth,
    containerHeight,
    slideWidth,
    slideHeight,
    scaleMode,
    zoomRatio
  ])
  nextScale = nextScale || scale
  scaleChange(nextScale)

  let nextTranslate = useMemo<[number, number]>(() => {
    if (!fullscreen && !rect) {
      return null
    }

    let width: number
    let height: number
    if (fullscreen) {
      width = window.document.documentElement.clientWidth
      height = window.document.documentElement.clientHeight
    } else {
      width = rect.width
      height = rect.height
    }
    const translateX =
      (Math.max(width - slideWidth * nextScale[0], padding) /
        (2 * slideWidth)) *
      100
    const translateY =
      (Math.max(height - slideHeight * nextScale[1], padding) /
        (2 * slideHeight)) *
      100
    return [translateX, translateY]
  }, [fullscreen, rect, nextScale, slideWidth, slideHeight])
  nextTranslate = nextTranslate || slideTranslate
  slideTranslateChange(nextTranslate)

  const nextBackgroundStyle = useMemo(() => {
    const newBackgroundStyle: React.CSSProperties = { overflow: 'hidden' }
    if (!containerWidth || !containerHeight) {
      return newBackgroundStyle
    }
    if (
      slideWidth * nextScale[0] + padding > containerWidth ||
      slideHeight * nextScale[1] + padding > containerHeight
    ) {
      newBackgroundStyle.overflow = 'auto'
    }
    return newBackgroundStyle
  }, [
    slideWidth,
    slideHeight,
    containerWidth,
    containerHeight,
    nextScale,
    zoomRatio
  ])

  const keyDown = useCallback(
    (e: KeyboardEvent) => {
      e.stopPropagation()
      const key = e.key as KeyDownKeys
      const { ctrlKey, metaKey, shiftKey } = e
      if (ChangePositionKeys.includes(key)) {
        let deltaPosition: DeltaPosition
        switch (key) {
          case 'ArrowUp':
            deltaPosition = { deltaX: 0, deltaY: -grid[1] }
            break
          case 'ArrowDown':
            deltaPosition = { deltaX: 0, deltaY: grid[1] }
            break
          case 'ArrowLeft':
            deltaPosition = { deltaX: -grid[0], deltaY: 0 }
            break
          case 'ArrowRight':
            deltaPosition = { deltaX: grid[0], deltaY: 0 }
            break
        }
        onChangeLayersPosition(
          deltaPosition,
          scale[0],
          DragTriggerTypes.KeyDown
        )
        return
      }
      if (key === 'Delete' || key === 'Backspace') {
        onDoLayerOperation(LayerOperations.Delete)
        return
      }
      switch (key) {
        case 'c':
        case 'C':
          if (ctrlKey || metaKey) {
            onDoLayerOperation(LayerOperations.Copy)
          }
          break
        case 'v':
        case 'V':
          if (ctrlKey || metaKey) {
            onDoLayerOperation(LayerOperations.Paste)
          }
          break
        case 'y':
        case 'Y':
          if (ctrlKey && !metaKey) {
            onDoLayerOperation(LayerOperations.Redo)
          }
          break
        case 'z':
        case 'Z':
          if (metaKey) {
            onDoLayerOperation(
              shiftKey ? LayerOperations.Redo : LayerOperations.Undo
            )
          } else if (ctrlKey) {
            onDoLayerOperation(LayerOperations.Undo)
          }
          break
      }
    },
    [scale, onChangeLayersPosition]
  )
  useEffect(() => {
    if (refBackground.current && onDoLayerOperation) {
      parentRef.current = refBackground.current
      refBackground.current.addEventListener('keydown', keyDown, false)
    }
    return () => {
      if (refBackground.current) {
        refBackground.current.removeEventListener('keydown', keyDown, false)
      }
    }
  }, [refBackground.current, onDoLayerOperation])

  const removeLayerOperationInfo = useCallback(() => {
    if (onRemoveLayerOperationInfo) {
      onRemoveLayerOperationInfo({ selected: false })
    }
    if (!onLabelEditorSelectedRange() && onRemoveLayerOperationInfo) {
      onRemoveLayerOperationInfo({ editing: false })
    }
  }, [onRemoveLayerOperationInfo])

  const slideBackgroundCls = classnames({
    'display-slide-background': true,
    [className]: !!className
  })

  return (
    <div
      ref={refBackground}
      className={slideBackgroundCls}
      style={nextBackgroundStyle}
      tabIndex={0}
      onClick={removeLayerOperationInfo}
    >
      {props.children}
    </div>
  )
}

SlideBackground.defaultProps = {
  padding: DISPLAY_CONTAINER_PADDING
}

export default SlideBackground
