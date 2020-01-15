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
import { Tooltip } from 'antd'

import 'antd/lib/radio/style/index.less'
import './LayerList.less'

interface ILayerRadioProps {
  id: number
  checked: boolean
  onChange: (layerId: number, checked: boolean, exclusive: boolean) => void
}

export const LayerRadio: React.FC<ILayerRadioProps> = (props) => {
  const { id, checked, onChange } = props

  const wrapperCls = classnames({
    'display-layer-radio': true,
    'ant-radio-wrapper-checked': checked
  })

  const radioCls = classnames({
    'ant-radio': true,
    'ant-radio-checked': checked
  })

  const change = useCallback(
    (e: React.MouseEvent<HTMLLabelElement>) => {
      e.preventDefault()
      const { altKey, metaKey } = e
      const exclusive = !altKey && !metaKey
      onChange(id, !checked, exclusive)
    },
    [id, checked, onChange]
  )

  return (
    <label className={wrapperCls} onClick={change}>
      <span className={radioCls}>
        <input
          type="radio"
          className="ant-radio-input"
          defaultChecked={checked}
        />
        <span className="ant-radio-inner" />
      </span>
      <Tooltip title={props.children} placement="right">
        <span>{props.children}</span>
      </Tooltip>
    </label>
  )
}

export const LayerRadioGroup: React.FC = (props) => (
  <div className="display-layer-radio-group ant-radio-group-outline">
    {props.children}
  </div>
)
