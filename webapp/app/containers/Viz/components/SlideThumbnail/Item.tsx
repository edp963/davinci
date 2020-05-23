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

import React, { useCallback, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import classnames from 'classnames'

import { Menu, Dropdown, message } from 'antd'
import { MenuProps } from 'antd/lib/menu'
import { ISlideFormed } from '../types'

import styles from './SlideThumbnail.less'

interface ISlideThumbnailProps {
  className?: string
  slide: ISlideFormed
  index: number
  current: boolean
  selected: boolean
  onSelect: (slideId: number, append: boolean) => void
  onDelete: (targetSlideId: number) => void
  onChangeDisplayAvatar: (avatar: string) => void
  onMove: (slideId: number, newIdx: number, done?: boolean) => void
}

const ThumbnailRatio = 3 / 4
export const SlideDndItemType = 'DisplaySlideSort'

type SlideDragObject = {
  type: string
  slideId: number
  originalIdx: number
}

type SlideDragCollectedProps = {
  isDragging: boolean
}

const SlideThumbnail: React.FC<ISlideThumbnailProps> = (props) => {
  const {
    slide,
    index,
    current,
    selected,
    className,
    onDelete,
    onSelect,
    onChangeDisplayAvatar,
    onMove
  } = props
  const { id: slideId, config } = slide
  const { width, height, avatar, backgroundColor } = config.slideParams

  const ref = useRef<HTMLDivElement>(null)
  const originalIdx = index
  const [{ isDragging }, drag] = useDrag<
    SlideDragObject,
    {},
    SlideDragCollectedProps
  >({
    item: { type: SlideDndItemType, slideId, originalIdx },
    end(_, monitor) {
      const { slideId: droppedId, originalIdx } = monitor.getItem()
      const didDrop = monitor.didDrop()
      onMove(droppedId, didDrop ? index : originalIdx, didDrop)
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const [, drop] = useDrop<SlideDragObject, {}, SlideDragCollectedProps>({
    accept: SlideDndItemType,
    canDrop: () => false,
    hover: ({ slideId: draggedId }) => {
      if (draggedId !== slideId) {
        onMove(draggedId, index)
      }
    }
  })

  drag(drop(ref))

  const handleClickRightMenu: MenuProps['onClick'] = useCallback(
    ({ key, domEvent }) => {
      domEvent.stopPropagation()
      if (key === 'delete') {
        onDelete(slideId)
        return
      }

      if (avatar) {
        onChangeDisplayAvatar(avatar)
      } else {
        message.error('请先为该大屏页设置封面')
      }
    },
    [onDelete, onChangeDisplayAvatar, slideId, avatar]
  )

  const selectSlide = useCallback(
    (e: React.MouseEvent) => {
      const { shiftKey, metaKey, altKey } = e
      e.stopPropagation()
      onSelect(slideId, shiftKey || metaKey || altKey)
    },
    [onSelect, slideId]
  )

  const cls = classnames({
    [className]: !!className,
    [styles.current]: current
  })

  const slideStyle: React.CSSProperties = {
    background: avatar && `url(${avatar}) center/cover`,
    backgroundColor: `rgba(${backgroundColor.join()})`
  }

  const divStyle: React.CSSProperties = { opacity: isDragging ? 0.1 : 1 }

  if (height / width <= ThumbnailRatio) {
    // landscape
    slideStyle.top = `${
      ((1 - (1 / ThumbnailRatio) * (height / width)) / 2) * 100
    }%`
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
    <Dropdown
      overlay={
        <Menu onClick={handleClickRightMenu}>
          <Menu.Item key="setAsCover">设置为封面</Menu.Item>
          <Menu.Item key="delete">删除</Menu.Item>
        </Menu>
      }
      trigger={['contextMenu']}
    >
      <li className={cls} onClick={selectSlide}>
        <div className={styles.serial}>{index + 1}</div>
        <div ref={ref} style={divStyle} className={styles.content}>
          <div className={thumbnailCls}>
            <div className={styles.cover} style={slideStyle} />
          </div>
        </div>
      </li>
    </Dropdown>
  )
}

export default SlideThumbnail
