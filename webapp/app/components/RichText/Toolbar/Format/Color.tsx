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

import React, { useContext } from 'react'
import classnames from 'classnames'

import { Icon } from 'antd'
import ColorPicker from 'components/ColorPicker'
import { TextProperties } from '../../Element/constants'
import { EditorContext } from '../../context'

interface IColorProps {
  type: TextProperties.Color | TextProperties.BackgroundColor
}

const ColorIcons = {
  [TextProperties.Color]: 'font-colors',
  [TextProperties.BackgroundColor]: 'bg-colors'
}

const Color: React.FC<IColorProps> = (props) => {
  const { toggleTextProperty, isTextPropertyActive } = useContext(EditorContext)
  const { type } = props

  const change = (value: string) => toggleTextProperty(type, value)

  const activeColor = isTextPropertyActive(type) as string
  let colorStyle: React.CSSProperties = {}
  if (activeColor) {
    colorStyle.borderBottomColor = activeColor
  }

  const cls = classnames({
    'anticon': true,
    'richtext-toolbar-color': true,
    'richtext-toolbar-icon-active': !!activeColor
  })

  return (
    <ColorPicker preset onChange={change} value={activeColor || '#000'}>
      <div className={cls} style={colorStyle}>
        <Icon type={ColorIcons[type]} />
      </div>
    </ColorPicker>
  )
}

export default Color
