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

import { ElementTypes } from '../Element'
import { EditorContext } from '../context'

import { Tooltip } from 'antd'
import IconFont from 'components/IconFont'

const Marquee: React.FC = () => {
  const { isElementActive, toggleElement } = useContext(EditorContext)

  const click = () => {
    toggleElement(ElementTypes.Marquee)
  }

  const currentActive = !!isElementActive(ElementTypes.Marquee)
  const cls = classnames({
    'richtext-toolbar-icon': true,
    'richtext-toolbar-icon-active': currentActive
  })

  return (
    <Tooltip title="滚屏字幕">
      <IconFont
        className={cls}
        tabIndex={-1}
        type="icon-bullet-subtitle"
        onClick={click}
      />
    </Tooltip>
  )
}

export default Marquee
