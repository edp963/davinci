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
  onSelect: (slideId: number) => void
  onDelete: (slideIds: number[]) => void
}

const SlideThumbnailList: React.FC<ISlideThumbnailListProps> = (props) => {
  const {
    slides,
    className,
    currentSlideId,
    selectedSlideIds,
    onSelect,
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
        title: '确认删除此大屏页？',
        onOk: () => {
          onDelete([...selectedSlideIds])
        }
      })
    }
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

  return (
    <ul className={cls}>
      {slides.map((slide, idx) => (
        <Item
          key={slide.id}
          slide={slide}
          serial={idx + 1}
          current={currentSlideId === slide.id}
          selected={selectedSlideIds.includes(slide.id)}
          onSelect={selectSlide}
        />
      ))}
    </ul>
  )
}

export default SlideThumbnailList
