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
import { useDrag, useDrop } from 'react-dnd';
import classnames from 'classnames'

import { Menu, Dropdown, message } from 'antd'
import { ISlideFormed } from '../types'

import styles from './SlideThumbnail.less'

interface ISlideThumbnailProps {
  className?: string
  slide: ISlideFormed
  serial: number
  current: boolean
  selected: boolean
  onSelect: (slideId: number) => void
  onDelete: (slideIds: number[]) => void
  selectedIds: number[]
  onMultiSelect: (slideId: number) => void
  onChangeDisplayAvatar: (avatar: string) => void
  onMoveSlide: (slideId: number, newPos: number) => void
  onMoveSlides: (id: number, toIndex: number) => void
}

const ThumbnailRatio = 3 / 4

const SlideThumbnail: React.FC<ISlideThumbnailProps> = (props) => {
  const { slide, serial, current, selected, selectedIds, className, onDelete, onSelect, onMultiSelect, onChangeDisplayAvatar, onMoveSlide, onMoveSlides } = props
  const { id: slideId, config } = slide
  const { width, height, avatar, backgroundColor } = config.slideParams

  const ref = useRef<HTMLDivElement>(null);
  // 使用 useDrag
  const [{ isDragging, didDrop }, drag] = useDrag({
    item: { type: 'Item', id: slideId, serial },
    end(item, monitor){
      let res = monitor.getDropResult();
      let id = item['id'];
      if(!!res) {
        let { newPos } = res;
        if (didDrop) {
          onMoveSlide(id, newPos)
        }
      } else {
        onMoveSlide(id, -1)
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      didDrop: monitor.didDrop()
    })
  })

  // 使用 useDrop
  const [, drop] = useDrop({
    accept: 'Item',
    drop(item, monitor) {
      if (!ref.current) {
        return
      }
      return { newPos: item['serial'] }
    },
    hover(item, monitor) {
      const { id: draggedId } = monitor.getItem()
      if (!ref.current) {
        return
      }
      const dragIndex = item['serial']
      const hoverIndex = serial
      if (dragIndex === hoverIndex) {
        return
      }
      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      item['serial'] = hoverIndex
      onMoveSlides(draggedId, hoverIndex - 1)
    },
  })

  drag(drop(ref))

  const handleClickRightMenu = useCallback(
    ({ item, key, keyPath, domEvent }) => {
      // console.log(item, key, keyPath, domEvent, slideId)
      if (key === 'setAsCover') {
        const { avatar } = slide.config.slideParams
        if (avatar) {
          onChangeDisplayAvatar(avatar)
        } else {
          message.error('请先为该大屏页设置封面')
        }
      } else if(key === 'delete'){
        onDelete([slideId])
      } else {
        onDelete([...selectedIds])
      }
    },
    [onDelete, onChangeDisplayAvatar, slideId, selectedIds]
  )

  const selectSlide = useCallback(
    (e: React.MouseEvent) => {
      // @TODO multi selection with keyboard press
      const { shiftKey, metaKey, altKey, button, buttons } = e
      // console.log(e.target)
      e.stopPropagation()

      if(metaKey || altKey) {
        onMultiSelect(slideId)
      } else {
        onSelect(slideId)
      }
    },
    [onSelect, onMultiSelect, slideId]
  )

  const cls = classnames({
    [className]: !!className,
    [styles.current]: current
  })

  const slideStyle: React.CSSProperties = {
    background: avatar && `url(${avatar}) center/cover`,
    backgroundColor: `rgba(${backgroundColor.join()})`,
  }

  const divStyle: React.CSSProperties = { opacity: isDragging ? 0.1 : 1 }

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
      <Dropdown overlay={
        selectedIds.length > 1 && selectedIds.indexOf(slideId) > -1 ?
          <Menu onClick={handleClickRightMenu}>
            <Menu.Item key="deleteAll">删除全部</Menu.Item>
          </Menu>
          :
          <Menu onClick={handleClickRightMenu}>
            <Menu.Item key="setAsCover">设置为封面</Menu.Item>
            <Menu.Item key="delete">删除</Menu.Item>
          </Menu>
        }
        trigger={['contextMenu']}
      >
        <li className={cls} onClick={selectSlide} >
          <div className={styles.serial}>{serial}</div>
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
