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
import { IconProps } from 'antd/lib/icon'

import { TextStyles } from '../../Element'
import { EditorContext } from '../../context'

interface ITextStyleProps extends IconProps {
  value: TextStyles
}

const TextStyleIcon: React.FC<ITextStyleProps> = (props) => {
  const { value, ...rest } = props
  const { isTextStyleActive, toggleTextStyle } = useContext(EditorContext)

  const toggle = () => {
    toggleTextStyle(value)
  }

  const cls = classnames({
    'richtext-toolbar-icon': true,
    'richtext-toolbar-icon-active': isTextStyleActive(value)
  })

  return <Icon className={cls} {...rest} onClick={toggle} />
}

export default TextStyleIcon
