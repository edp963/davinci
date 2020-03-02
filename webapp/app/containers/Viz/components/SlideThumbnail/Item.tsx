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

import React, { useCallback } from 'react'
import classnames from 'classnames'

import { ISlideFormed } from '../types'

import styles from './SlideThumbnail.less'

interface ISlideThumbnailProps {
  className?: string
  slide: ISlideFormed
  serial: number
  current: boolean
  selected: boolean
  onSelect: (slideId: number) => void
}

const ThumbnailRatio = 3 / 4

const SlideThumbnail: React.FC<ISlideThumbnailProps> = (props) => {
  const { slide, serial, current, selected, className, onSelect } = props
  const { id: slideId, config } = slide
  const { width, height, avatar, backgroundColor } = config.slideParams

  const selectSlide = useCallback(
    (e: React.MouseEvent) => {
      // @TODO multi selection with keyboard press
      // const { shiftKey, metaKey, altKey } = e
      e.stopPropagation()
      onSelect(slideId)
    },
    [onSelect, slideId]
  )

  const cls = classnames({
    [className]: !!className,
    [styles.current]: current
  })

  const slideStyle: React.CSSProperties = {
    background: avatar && `url(${avatar}) center/cover`,
    backgroundColor: `rgba(${backgroundColor.join()})`,
  }

  if (height / width <= ThumbnailRatio) {
    // landscape
    slideStyle.top = `${((1 - (1 / ThumbnailRatio) * (height / width)) / 2) * 100}%`
    slideStyle.bottom = slideStyle.top
    slideStyle.width = '100%'
  } else {
    // portrait
    slideStyle.left = `${((1 - ThumbnailRatio * (width / height)) / 2) * 100}%`
    slideStyle.right = slideStyle.left
    slideStyle.height = '100%'
  }

  const thumbnailCls = classnames({
    [styles.thumbnail]: true,
    [styles.selected]: selected
  })

  return (
    <li onClick={selectSlide} className={cls}>
      <div className={styles.serial}>{serial}</div>
      <div className={styles.content}>
        <div className={thumbnailCls}>
          <div className={styles.cover} style={slideStyle} />
        </div>
      </div>
    </li>
  )
}

export default SlideThumbnail
