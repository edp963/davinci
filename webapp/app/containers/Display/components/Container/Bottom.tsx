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

import React, { useContext, useMemo } from 'react'
import { Icon, Tooltip, Slider } from 'antd'
import { ContainerContext } from './ContainerContext'

interface IDisplayBottomProps {
  onCreateCover: () => void
}

const DisplayBottom: React.FC<IDisplayBottomProps> = (props) => {
  const { onCreateCover } = props
  const { sliderValue, scale, zoomIn, zoomOut, sliderChange } = useContext(
    ContainerContext
  )

  const percentage = useMemo(() => {
    if (!scale) { return '' }
    if (scale[0] === scale[1]) {
      return `${Math.floor(scale[0] * 100)}%`
    }
    return scale.map((s: number) => `${Math.floor(s * 100)}%`).join('/')
  }, [
    scale
  ])

  return (
    <div className="display-bottom">
      <div className="display-bottom-screenshot">
        <Tooltip title="点击生成截图封面">
          <Icon type="picture" onClick={onCreateCover} />
        </Tooltip>
      </div>
      <div className="display-bottom-slider-wrapper">
        <label>{percentage}</label>
        <Icon type="minus-circle-o" onClick={zoomIn} />
        <Slider
          className="display-bottom-slider"
          value={sliderValue}
          onChange={sliderChange}
        />
        <Icon type="plus-circle-o" onClick={zoomOut} />
      </div>
    </div>
  )
}

export default DisplayBottom
