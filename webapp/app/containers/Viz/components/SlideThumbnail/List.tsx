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

import React, { useCallback, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import classnames from 'classnames'

import { ISlideFormed } from '../types'

import { Modal } from 'antd'
import Item from './Item'

import styles from './SlideThumbnail.less'

interface ISlideThumbnailListProps {
  slides: ISlideFormed[]
  className?: string
  currentSlideId: number
  // @TODO multi selection for slides
  selectedSlideIds: number[]
  onMultiSelect: (slideId: number) => void
  onMoveSlide: (newSlides: ISlideFormed[]) => void
  onMoveSlides: (newSlides: ISlideFormed[]) => void
  onSelect: (slideId: number) => void
  onDelete: (slideIds: number[]) => void
  onChangeDisplayAvatar: (avatar: string) => void
}

const SlideThumbnailList: React.FC<ISlideThumbnailListProps> = (props) => {
  const {
    slides,
    className,
    currentSlideId,
    selectedSlideIds,
    onSelect,
    onMultiSelect,
    onMoveSlide,// didDrag
    onMoveSlides,// hovering
    onChangeDisplayAvatar,
    onDelete
  } = props

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
        title: selectedSlideIds.length > 1 ? '确认删除所有选中大屏页？' : '确认删除此大屏页？',
        onOk: () => {
          onDelete([...selectedSlideIds])
        }
      })
    };

    window.addEventListener('keydown', deleteSlides, false)
    return () => {
      window.removeEventListener('keydown', deleteSlides, false)
    }
  }, [selectedSlideIds, onDelete])

  const selectSlide = useCallback(
    (slideId: number) => {
      onSelect(slideId)
    },
    [onSelect]
  )

  const cls = classnames({
    [styles.thumbnails]: true,
    [className]: !!className
  })

  const multiSelectSlides = useCallback(
    (slideId: number) => {
      onMultiSelect(slideId)
    },
    [onMultiSelect]
  )

  const moveSlides = useCallback(
    (id: number, toIndex: number) => {
      const item = slides.find(s => s.id === id);
      const index = slides.indexOf(item);
      slides.splice(index, 1);
      slides.splice(toIndex, 0, item);
      onMoveSlides([...slides]);
    },[onMoveSlides, slides]
  )

  const moveSlide = useCallback(
    (slideId: number, newPos: number) => {
      slides.sort((a,b) => { return a.index - b.index; })
      let oldPos = slides.findIndex(s => s.id === slideId) + 1
      if(newPos === oldPos || newPos < 0){
        onMoveSlides(JSON.parse(JSON.stringify(slides)))
        return
      }
      let tmpSlides = newPos > oldPos ? slides.slice(oldPos - 1, newPos) : slides.slice(newPos - 1, oldPos)
      let newSlides = JSON.parse(JSON.stringify(tmpSlides))
      let newIdx = slides[newPos - 1].index
      // console.log(slideId, newIdx, newPos, oldPos)
      newSlides = newSlides.map((item, idx) => {
        if(item.id !== slideId) {
          item.index = newPos > oldPos ? tmpSlides[idx - 1].index : tmpSlides[idx + 1].index
        } else {
          item.index = newIdx
        }
        return item
      })
      // console.log('newSlides,originSlides:', newSlides, originSlides)
      onMoveSlide(newSlides)
    },
    [onMoveSlide, slides]
  )

  return (
    <DndProvider backend={ HTML5Backend }>
      <ul className={cls}>
        { slides.map((slide, idx) => (
          <Item
            key={slide.id}
            slide={slide}
            serial={idx + 1}
            current={currentSlideId === slide.id}
            selected={selectedSlideIds.includes(slide.id)}
            onSelect={selectSlide}
            selectedIds={selectedSlideIds}
            onMultiSelect={multiSelectSlides}
            onDelete={onDelete}
            onMoveSlide={moveSlide}
            onMoveSlides={moveSlides}
            onChangeDisplayAvatar={onChangeDisplayAvatar}
          />
        ))}
      </ul>
    </DndProvider>
  )
}

export default SlideThumbnailList
