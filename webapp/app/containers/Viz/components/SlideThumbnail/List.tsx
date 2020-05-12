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

import React, { useCallback, useEffect, useState } from 'react'
import { DndProvider, useDrop } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import classnames from 'classnames'

import { ISlideFormed } from '../types'

import { Modal } from 'antd'
import Item, { SlideDndItemType } from './Item'

import styles from './SlideThumbnail.less'

interface ISlideThumbnailListProps {
  slides: ISlideFormed[]
  className?: string
  currentSlideId: number
  selectedSlideIds: number[]
  onChange: (newSlides: ISlideFormed[]) => void
  onSelect: (slideId: number, append: boolean) => void
  onDelete: (targetSlideId?: number) => void
  onChangeDisplayAvatar: (avatar: string) => void
}

const SlideThumbnailList: React.FC<ISlideThumbnailListProps> = (props) => {
  const {
    slides,
    className,
    currentSlideId,
    selectedSlideIds,
    onSelect,
    onChange,
    onChangeDisplayAvatar,
    onDelete
  } = props

  const [localSlides, setLocalSlides] = useState(slides)
  const [movingRange, setMovingRange] = useState<[number, number]>([
    slides.length - 1,
    0
  ])
  useEffect(() => {
    setLocalSlides(slides)
    setMovingRange([slides.length - 1, 0])
  }, [slides])

  useEffect(() => {
    const deleteSlides = (e: KeyboardEvent) => {
      if (e.keyCode !== 8 && e.keyCode !== 46) {
        return
      }
      if (!selectedSlideIds.length) {
        return
      }
      window.removeEventListener('keydown', deleteSlides, false)
      Modal.confirm({
        title:
          selectedSlideIds.length > 1
            ? '确认删除所有选中的大屏页？'
            : '确认删除此大屏页？',
        onOk: () => {
          onDelete()
        }
      })
    }

    window.addEventListener('keydown', deleteSlides, false)
    return () => {
      window.removeEventListener('keydown', deleteSlides, false)
    }
  }, [selectedSlideIds, onDelete])

  const cls = classnames({
    [styles.thumbnails]: true,
    [className]: !!className
  })

  const moveSlide = useCallback(
    (slideId: number, targetIdx: number, done: boolean) => {
      const prevIdx = localSlides.findIndex(({ id }) => id === slideId)
      const updatedSlides = [...localSlides]
      updatedSlides.splice(prevIdx, 1)
      updatedSlides.splice(targetIdx, 0, localSlides[prevIdx])
      setLocalSlides(updatedSlides)
      setMovingRange([
        Math.min(movingRange[0], prevIdx, targetIdx),
        Math.max(movingRange[1], prevIdx, targetIdx)
      ])
      if (done) {
        const partialSlides = updatedSlides
          .slice(movingRange[0], movingRange[1] + 1)
          .map((slide, partialIdx) => ({
            ...slide,
            index: slides[partialIdx + movingRange[0]].index
          }))
        onChange(partialSlides)
      }
    },
    [movingRange, slides, localSlides, onChange]
  )

  const [, drop] = useDrop({ accept: SlideDndItemType })
  return (
    <ul ref={drop} className={cls}>
      {localSlides.map((slide, idx) => (
        <Item
          key={slide.id}
          slide={slide}
          index={idx}
          current={currentSlideId === slide.id}
          selected={selectedSlideIds.includes(slide.id)}
          onSelect={onSelect}
          onDelete={onDelete}
          onMove={moveSlide}
          onChangeDisplayAvatar={onChangeDisplayAvatar}
        />
      ))}
    </ul>
  )
}

const withDnd: React.FC<ISlideThumbnailListProps> = (props) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <SlideThumbnailList {...props} />
    </DndProvider>
  )
}

export default withDnd
