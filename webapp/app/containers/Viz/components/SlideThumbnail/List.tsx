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
  onMultiSelect: (slideId: number) => void,//test-nx
  // onMoveSlide: (slideId: number, newPos: number) => void,//test-nx
  onMoveSlide: (newSlides: ISlideFormed[]) => void,//test-nx
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
    onMultiSelect,//test-nx
    onMoveSlide,//test-nx
    onChangeDisplayAvatar,//test-nx
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
        title: selectedSlideIds.length > 1 ? '确认删除选中所有大屏页？' : '确认删除此大屏页？',
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

  //test-nx
  const multiSelectSlides = useCallback(
    (slideId: number) => {
      onMultiSelect(slideId)
    },
    [onMultiSelect]
  )

  // const moveSlide = useCallback(
  //   (slideId: number, newPos: number) => {
  //     onMoveSlide(slideId, newPos)
  //   },
  //   [onMoveSlide]
  // )

  const moveSlide = useCallback(
    (slideId: number, newPos: number) => {
      let moveItem = null;
      let tmpSlides = slides.filter((slide) => {
          if(slide.id !== slideId){
            return true
          } else {
            moveItem = JSON.parse(JSON.stringify(slide))
            return false
          }}
        );
      if(moveItem.index === newPos-1){
        console.log('nothing move')
      }
      // console.log('slideId:', slideId, 'newPos:', newPos)
      tmpSlides.splice(newPos-1,0,moveItem)
      const newSlides = tmpSlides.map((slide, index) => {
        slide.index = index;
        return slide;
      })
      onMoveSlide(newSlides)
    },
    [onMoveSlide]
  )

  const changeDisplayAvatar = useCallback(
    (avatar: string) => {
      onChangeDisplayAvatar(avatar)
    },
    [onChangeDisplayAvatar]
  )
  //test-nx

  return (
    <DndProvider backend={ HTML5Backend }>
        <ul className={cls}>
          {slides.map((slide, idx) => (
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
              onChangeDisplayAvatar={changeDisplayAvatar}
            />
          ))}
        </ul>
    </DndProvider>
  )
}

export default SlideThumbnailList
