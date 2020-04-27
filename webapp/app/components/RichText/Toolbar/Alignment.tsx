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

import React, { useCallback, useContext } from 'react'
import classnames from 'classnames'

import { Icon } from 'antd'
import { BlockProperties, BlockAlignments } from '../Element/constants'
import { EditorContext } from '../context'

const Alignment: React.FC = () => {
  const { isBlockPropertyActive, toggleBlockProperty } = useContext(
    EditorContext
  )
  const isActive = (value: BlockAlignments) =>
    !!isBlockPropertyActive(BlockProperties.TextAlign, value)
  const toggle = (value) => {
    toggleBlockProperty(BlockProperties.TextAlign, value)
  }
  return (
    <>
      <AlignmentItem
        value={BlockAlignments.AlignLeft}
        type="align-left"
        isActive={isActive}
        onToggle={toggle}
      />
      <AlignmentItem
        value={BlockAlignments.AlignCenter}
        type="align-center"
        isActive={isActive}
        onToggle={toggle}
      />
      <AlignmentItem
        value={BlockAlignments.AlignRight}
        type="align-right"
        isActive={isActive}
        onToggle={toggle}
      />
    </>
  )
}

export default Alignment

interface IAlignmentItemProps {
  value: BlockAlignments
  type: string
  isActive: (value: BlockAlignments) => boolean
  onToggle: (value: BlockAlignments) => void
}
const AlignmentItem: React.FC<IAlignmentItemProps> = (props) => {
  const { value, type, isActive, onToggle } = props
  const toggle = useCallback(() => {
    onToggle(value)
  }, [value])
  const cls = classnames({
    'richtext-toolbar-icon': true,
    'richtext-toolbar-icon-active': isActive(value)
  })
  return <Icon className={cls} type={type} onClick={toggle} />
}
